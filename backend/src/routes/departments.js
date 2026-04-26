const express = require('express');
const prisma = require('../prisma');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   GET api/departments
// @desc    Get all departments
router.get('/', authMiddleware, async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(departments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/departments
// @desc    Create a department (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { name } = req.body;
  try {
    const department = await prisma.department.create({
      data: { name }
    });
    res.status(201).json(department);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ message: 'Department already exists' });
    }
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/departments/:id
// @desc    Update a department (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { name } = req.body;
  try {
    const department = await prisma.department.update({
      where: { id: req.params.id },
      data: { name }
    });
    res.json(department);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ message: 'Department already exists' });
    }
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/departments/:id
// @desc    Delete a department (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await prisma.department.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Department deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/departments/stats
// @desc    Get department statistics
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        users: {
          include: {
            skills: true
          }
        }
      }
    });

    const stats = departments.map(dept => {
      const users = dept.users;
      if (users.length === 0) {
        return {
          id: dept.id,
          name: dept.name,
          avgScore: 0,
          userCount: 0,
          topPerformer: null
        };
      }

      const totalScore = users.reduce((sum, u) => sum + u.totalScore, 0);
      const avgScore = totalScore / users.length;
      
      const topPerformer = users.reduce((prev, current) => 
        (prev.totalScore > current.totalScore) ? prev : current
      );

      return {
        id: dept.id,
        name: dept.name,
        avgScore: parseFloat(avgScore.toFixed(2)),
        userCount: users.length,
        topPerformer: {
          id: topPerformer.id,
          fullName: topPerformer.fullName,
          totalScore: topPerformer.totalScore
        }
      };
    });

    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
