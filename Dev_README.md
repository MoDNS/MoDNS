## Backend, please do this before anything
Make sure the 'backend_build' directory exists alonside other directories like 'cli', 'frontend', 'plugins', etc.

Inside 'backend_build' should be an empty directory called 'target' and an empty .lock file called 'Cargo.lock'. Please create 'target' and 'Cargo.lock' as specified if they are not already there.

## Command to Run DockerDevMode 
Initially: docker compose up --build
After: docker compose up