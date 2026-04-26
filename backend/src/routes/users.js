const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../prisma');

const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   GET api/users
// @desc    Get all users with sorting and filtering (Admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { sortBy, order, sortBySkill, departmentId } = req.query;

  try {
    let queryOptions = {
      include: {
        skills: true,
        department: true,
      },
      orderBy: {},
    };

    // Standard sorting
    if (sortBy && sortBy !== 'skillRating') {
      queryOptions.orderBy[sortBy] = order === 'desc' ? 'desc' : 'asc';
    } else if (!sortBySkill) {
      queryOptions.orderBy['totalScore'] = 'desc';
    }

    if (departmentId) {
      queryOptions.where = { departmentId };
    }

    let users = await prisma.user.findMany(queryOptions);

    // Manual sorting by specific skill rating
    if (sortBySkill) {
      users = users.sort((a, b) => {
        const aSkill = a.skills.find(s => s.masterSkillId === sortBySkill);
        const bSkill = b.skills.find(s => s.masterSkillId === sortBySkill);
        
        const aRating = aSkill ? aSkill.rating : 0;
        const bRating = bSkill ? bSkill.rating : 0;
        
        return order === 'asc' ? aRating - bRating : bRating - aRating;
      });
    }

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/profile
// @desc    Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { skills: true, department: true },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Don't send password hash
    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/users
// @desc    Create a user (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { fullName, email, password, role, departmentId } = req.body;

  try {
    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash: hashedPassword,
        role: role || 'user',
        departmentId: departmentId || null,
      },
    });

    const { passwordHash, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/:id
// @desc    Update a user (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { fullName, email, password, role, departmentId } = req.body;

  try {
    let user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateData = {
      fullName: fullName || user.fullName,
      email: email || user.email,
      role: role || user.role,
      departmentId: departmentId !== undefined ? departmentId : user.departmentId,
    };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(password, salt);
    }

    user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
    });

    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/users/:id
// @desc    Delete a user (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

