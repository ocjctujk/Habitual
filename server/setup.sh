#!/bin/bash

echo "🚀 Habit Tracker API Setup Script"
echo "=================================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install it first."
    echo "   Ubuntu/Debian: sudo apt install postgresql"
    echo "   macOS: brew install postgresql"
    exit 1
fi

echo "✓ PostgreSQL is installed"

# Get database credentials
echo ""
read -p "Enter PostgreSQL username [default: postgres]: " DB_USER
DB_USER=${DB_USER:-postgres}

read -p "Enter PostgreSQL password: " -s DB_PASS
echo ""

read -p "Enter database name [default: habit_tracker]: " DB_NAME
DB_NAME=${DB_NAME:-habit_tracker}

# Create database
echo ""
echo "Creating database '$DB_NAME'..."
PGPASSWORD=$DB_PASS psql -U $DB_USER -h localhost -c "CREATE DATABASE $DB_NAME;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✓ Database created successfully"
else
    echo "⚠ Database might already exist or there was an error"
fi

# Create .env file
echo ""
echo "Creating .env file..."

cat > .env << EOF
PORT=5000
NODE_ENV=development

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=$DB_USER
DB_PASSWORD=$DB_PASS
DB_DATABASE=$DB_NAME

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d
EOF

echo "✓ .env file created"

# Install dependencies
echo ""
read -p "Install npm dependencies? (y/n) [default: y]: " INSTALL_DEPS
INSTALL_DEPS=${INSTALL_DEPS:-y}

if [ "$INSTALL_DEPS" = "y" ] || [ "$INSTALL_DEPS" = "Y" ]; then
    echo "Installing dependencies..."
    npm install
    echo "✓ Dependencies installed"
fi

echo ""
echo "=================================="
echo "✅ Setup complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "To build for production:"
echo "  npm run build"
echo "  npm start"
echo ""
