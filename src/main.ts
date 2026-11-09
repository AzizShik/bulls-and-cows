import './styles/main.css';
import { mountApp } from './ui/app';

const root = document.createElement('div');
root.id = 'app';
document.body.append(root);

mountApp(root);
