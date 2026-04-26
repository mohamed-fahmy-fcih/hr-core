const express = require('express');
const prisma = require('../prisma');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   GET api/master-skills
// @desc    Get all master skills
router.get('/', authMiddleware, async (req, res) => {
  try {
    const skills = await prisma.masterSkill.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(skills);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/master-skills
// @desc    Create a master skill (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, weight } = req.body;

  try {
    const existing = await prisma.masterSkill.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({ message: 'Skill already exists' });
    }

    const skill = await prisma.masterSkill.create({
      data: { name, weight },
    });

    res.status(201).json(skill);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/master-skills/:id
// @desc    Update a master skill (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, weight } = req.body;

  try {
    const skill = await prisma.masterSkill.update({
      where: { id: req.params.id },
      data: { name, weight },
    });

    res.json(skill);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/master-skills/:id
// @desc    Delete a master skill (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await prisma.masterSkill.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Skill deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
