import { Router } from 'express';
import { 
  renderDashboard, 
  renderPost, 
  previewImage, 
  publishPost, 
  triggerJob 
} from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/', renderDashboard);
router.get('/post/:id', renderPost);
router.get('/generate-image/:id', previewImage);
router.post('/publish/:id', publishPost);
router.post('/trigger-job', triggerJob);

export default router;
