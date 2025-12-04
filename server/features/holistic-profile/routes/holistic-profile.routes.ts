import { Router } from 'express';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';
import * as service from '../services/holistic-profile.service.js';

const router = Router();
router.use(validateSchoolAccess);

// Combined endpoint - Get all holistic profile data for a student
router.get('/student/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const profile = service.getStudentHolisticProfile(studentId);
    res.json(profile);
  } catch (error) {
    console.error('Error fetching holistic profile:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch holistic profile' });
  }
});

// STRENGTHS routes
router.get('/strengths/student/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const strengths = service.getStudentStrengths(studentId);
    res.json(strengths);
  } catch (error) {
    console.error('Error fetching strengths:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch strengths' });
  }
});

router.get('/strengths/student/:studentId/latest', (req, res) => {
  try {
    const { studentId } = req.params;
    const strength = service.getLatestStudentStrength(studentId);
    res.json(strength);
  } catch (error) {
    console.error('Error fetching latest strength:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch latest strength' });
  }
});

router.post('/strengths', (req, res) => {
  try {
    const strength = service.createStrength(req.body);
    res.status(201).json(strength);
  } catch (error) {
    console.error('Error creating strength:', error);
    res.status(500).json({ success: false, error: 'Failed to create strength' });
  }
});

router.put('/strengths/:id', (req, res) => {
  try {
    const { id } = req.params;
    const strength = service.updateStrength(id, req.body);
    res.json(strength);
  } catch (error) {
    console.error('Error updating strength:', error);
    res.status(500).json({ success: false, error: 'Failed to update strength' });
  }
});

router.delete('/strengths/:id', (req, res) => {
  try {
    const { id } = req.params;
    service.deleteStrength(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting strength:', error);
    res.status(500).json({ success: false, error: 'Failed to delete strength' });
  }
});

// SOCIAL RELATIONS routes
router.get('/social-relations/student/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const relations = service.getStudentSocialRelations(studentId);
    res.json(relations);
  } catch (error) {
    console.error('Error fetching social relations:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch social relations' });
  }
});

router.get('/social-relations/student/:studentId/latest', (req, res) => {
  try {
    const { studentId } = req.params;
    const relation = service.getLatestStudentSocialRelation(studentId);
    res.json(relation);
  } catch (error) {
    console.error('Error fetching latest social relation:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch latest social relation' });
  }
});

router.post('/social-relations', (req, res) => {
  try {
    const relation = service.createSocialRelation(req.body);
    res.status(201).json(relation);
  } catch (error) {
    console.error('Error creating social relation:', error);
    res.status(500).json({ success: false, error: 'Failed to create social relation' });
  }
});

router.put('/social-relations/:id', (req, res) => {
  try {
    const { id } = req.params;
    const relation = service.updateSocialRelation(id, req.body);
    res.json(relation);
  } catch (error) {
    console.error('Error updating social relation:', error);
    res.status(500).json({ success: false, error: 'Failed to update social relation' });
  }
});

router.delete('/social-relations/:id', (req, res) => {
  try {
    const { id } = req.params;
    service.deleteSocialRelation(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting social relation:', error);
    res.status(500).json({ success: false, error: 'Failed to delete social relation' });
  }
});

// INTERESTS routes
router.get('/interests/student/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const interests = service.getStudentInterests(studentId);
    res.json(interests);
  } catch (error) {
    console.error('Error fetching interests:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch interests' });
  }
});

router.get('/interests/student/:studentId/latest', (req, res) => {
  try {
    const { studentId } = req.params;
    const interest = service.getLatestStudentInterest(studentId);
    res.json(interest);
  } catch (error) {
    console.error('Error fetching latest interest:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch latest interest' });
  }
});

router.post('/interests', (req, res) => {
  try {
    const interest = service.createInterest(req.body);
    res.status(201).json(interest);
  } catch (error) {
    console.error('Error creating interest:', error);
    res.status(500).json({ success: false, error: 'Failed to create interest' });
  }
});

router.put('/interests/:id', (req, res) => {
  try {
    const { id } = req.params;
    const interest = service.updateInterest(id, req.body);
    res.json(interest);
  } catch (error) {
    console.error('Error updating interest:', error);
    res.status(500).json({ success: false, error: 'Failed to update interest' });
  }
});

router.delete('/interests/:id', (req, res) => {
  try {
    const { id } = req.params;
    service.deleteInterest(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting interest:', error);
    res.status(500).json({ success: false, error: 'Failed to delete interest' });
  }
});

// FUTURE VISION routes
router.get('/future-vision/student/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const visions = service.getStudentFutureVision(studentId);
    res.json(visions);
  } catch (error) {
    console.error('Error fetching future vision:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch future vision' });
  }
});

router.get('/future-vision/student/:studentId/latest', (req, res) => {
  try {
    const { studentId } = req.params;
    const vision = service.getLatestStudentFutureVision(studentId);
    res.json(vision);
  } catch (error) {
    console.error('Error fetching latest future vision:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch latest future vision' });
  }
});

router.post('/future-vision', (req, res) => {
  try {
    const vision = service.createFutureVision(req.body);
    res.status(201).json(vision);
  } catch (error) {
    console.error('Error creating future vision:', error);
    res.status(500).json({ success: false, error: 'Failed to create future vision' });
  }
});

router.put('/future-vision/:id', (req, res) => {
  try {
    const { id } = req.params;
    const vision = service.updateFutureVision(id, req.body);
    res.json(vision);
  } catch (error) {
    console.error('Error updating future vision:', error);
    res.status(500).json({ success: false, error: 'Failed to update future vision' });
  }
});

router.delete('/future-vision/:id', (req, res) => {
  try {
    const { id } = req.params;
    service.deleteFutureVision(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting future vision:', error);
    res.status(500).json({ success: false, error: 'Failed to delete future vision' });
  }
});

// SEL COMPETENCIES routes
router.get('/sel-competencies/student/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const competencies = service.getStudentSELCompetencies(studentId);
    res.json(competencies);
  } catch (error) {
    console.error('Error fetching SEL competencies:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch SEL competencies' });
  }
});

router.get('/sel-competencies/student/:studentId/latest', (req, res) => {
  try {
    const { studentId } = req.params;
    const competency = service.getLatestStudentSELCompetency(studentId);
    res.json(competency);
  } catch (error) {
    console.error('Error fetching latest SEL competency:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch latest SEL competency' });
  }
});

router.post('/sel-competencies', (req, res) => {
  try {
    const competency = service.createSELCompetency(req.body);
    res.status(201).json(competency);
  } catch (error) {
    console.error('Error creating SEL competency:', error);
    res.status(500).json({ success: false, error: 'Failed to create SEL competency' });
  }
});

router.put('/sel-competencies/:id', (req, res) => {
  try {
    const { id } = req.params;
    const competency = service.updateSELCompetency(id, req.body);
    res.json(competency);
  } catch (error) {
    console.error('Error updating SEL competency:', error);
    res.status(500).json({ success: false, error: 'Failed to update SEL competency' });
  }
});

router.delete('/sel-competencies/:id', (req, res) => {
  try {
    const { id } = req.params;
    service.deleteSELCompetency(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting SEL competency:', error);
    res.status(500).json({ success: false, error: 'Failed to delete SEL competency' });
  }
});

// SOCIOECONOMIC routes
router.get('/socioeconomic/student/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const socioeconomic = service.getStudentSocioeconomic(studentId);
    res.json(socioeconomic);
  } catch (error) {
    console.error('Error fetching socioeconomic:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch socioeconomic' });
  }
});

router.get('/socioeconomic/student/:studentId/latest', (req, res) => {
  try {
    const { studentId } = req.params;
    const socioeconomic = service.getLatestStudentSocioeconomic(studentId);
    res.json(socioeconomic);
  } catch (error) {
    console.error('Error fetching latest socioeconomic:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch latest socioeconomic' });
  }
});

router.post('/socioeconomic', (req, res) => {
  try {
    const socioeconomic = service.createSocioeconomic(req.body);
    res.status(201).json(socioeconomic);
  } catch (error) {
    console.error('Error creating socioeconomic:', error);
    res.status(500).json({ success: false, error: 'Failed to create socioeconomic' });
  }
});

router.put('/socioeconomic/:id', (req, res) => {
  try {
    const { id } = req.params;
    const socioeconomic = service.updateSocioeconomic(id, req.body);
    res.json(socioeconomic);
  } catch (error) {
    console.error('Error updating socioeconomic:', error);
    res.status(500).json({ success: false, error: 'Failed to update socioeconomic' });
  }
});

router.delete('/socioeconomic/:id', (req, res) => {
  try {
    const { id } = req.params;
    service.deleteSocioeconomic(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting socioeconomic:', error);
    res.status(500).json({ success: false, error: 'Failed to delete socioeconomic' });
  }
});

export default router;
