import { writeFileSync } from 'fs';
import { execSync } from 'child_process';

// Create a tar archive of the project
try {
  execSync('tar -czf project.tar.gz --exclude="node_modules" --exclude=".bolt" --exclude="dist" --exclude="*.tar.gz" .');
  console.log('Project archived successfully!');
} catch (error) {
  console.error('Error creating archive:', error);
}