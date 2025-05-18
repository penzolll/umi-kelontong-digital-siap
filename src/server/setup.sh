
#!/bin/bash

# Update system packages
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js and npm if not present
if ! [ -x "$(command -v node)" ]; then
  echo "Installing Node.js and npm..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# Install PostgreSQL if not present
if ! [ -x "$(command -v psql)" ]; then
  echo "Installing PostgreSQL..."
  sudo apt-get install -y postgresql postgresql-contrib
  
  # Start PostgreSQL service
  sudo systemctl start postgresql
  sudo systemctl enable postgresql
fi

# Install project dependencies
echo "Installing project dependencies..."
npm install

# Create uploads directory structure
echo "Creating directory structure for uploads..."
mkdir -p ../uploads/products
mkdir -p ../uploads/categories

# Create database and user
echo "Setting up PostgreSQL database..."
sudo -u postgres psql -c "CREATE DATABASE digital_grocery;"
sudo -u postgres psql -c "CREATE USER digital_grocery_user WITH ENCRYPTED PASSWORD 'your_db_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE digital_grocery TO digital_grocery_user;"

# Create .env file from example if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file from template..."
  cp .env.example .env
  echo "Please update the .env file with your actual configuration values"
fi

# Initialize database
echo "Initializing database schema..."
node db/init-db.js

# Install PM2 globally
echo "Installing PM2 for process management..."
sudo npm install -g pm2

echo "Setup completed successfully!"
echo "To start the server in development mode: npm run dev"
echo "To start the server in production mode: npm run start"
