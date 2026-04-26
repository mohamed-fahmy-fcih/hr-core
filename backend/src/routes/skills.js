const express = require('express');
const prisma = require('../prisma');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

const updateUserTotalScore = async (userId) => {
  const skills = await prisma.skill.findMany({ where: { userId } });
  const totalScore = skills.reduce((sum, skill) => sum + skill.calculatedScore, 0);
  
  await prisma.user.update({
    where: { id: userId },
    data: { totalScore },
  });
};

// @route   POST api/skills
// @desc    Assign skill to user (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { userId, masterSkillId, rating } = req.body;

  try {
    const existingSkill = await prisma.skill.findFirst({
      where: { userId, masterSkillId }
    });
    if (existingSkill) {
      return res.status(400).json({ message: 'Skill already assigned to this user' });
    }

    const masterSkill = await prisma.masterSkill.findUnique({ where: { id: masterSkillId } });
    if (!masterSkill) return res.status(404).json({ message: 'Master skill not found' });

    const calculatedScore = (rating / 5) * masterSkill.weight;

    const skill = await prisma.skill.create({
      data: {
        userId,
        masterSkillId,
        skillName: masterSkill.name,
        rating,
        weight: masterSkill.weight,
        calculatedScore,
      },
    });

    await updateUserTotalScore(userId);

    res.status(201).json(skill);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/skills/user/:userId
// @desc    Get all skills for a user
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    // Only the user themselves or an admin can view skills
    if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Authorization denied' });
    }

    const skills = await prisma.skill.findMany({
      where: { userId: req.params.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(skills);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/skills/:id
// @desc    Update skill (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { rating, weight, skillName } = req.body;

  try {
    let skill = await prisma.skill.findUnique({ where: { id: req.params.id } });
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    const updatedRating = rating || skill.rating;
    const updatedWeight = weight !== undefined ? weight : skill.weight;
    const calculatedScore = (updatedRating / 5) * updatedWeight;

    skill = await prisma.skill.update({
      where: { id: req.params.id },
      data: {
        skillName: skillName || skill.skillName,
        rating: updatedRating,
        weight: updatedWeight,
        calculatedScore,
      },
    });

    await updateUserTotalScore(skill.userId);

    res.json(skill);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/skills/:id
// @desc    Delete skill (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const skill = await prisma.skill.findUnique({ where: { id: req.params.id } });
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    await prisma.skill.delete({ where: { id: req.params.id } });
    await updateUserTotalScore(skill.userId);
    
    res.json({ message: 'Skill removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
