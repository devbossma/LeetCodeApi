#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🚀 LeetCode API - Docker Setup Script"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating .env from template..."
    
    if [ -f .env.docker ]; then
        cp .env.docker .env
        echo -e "${GREEN}✅ Created .env file${NC}"
        echo -e "${YELLOW}⚠️  IMPORTANT: Edit .env and update passwords!${NC}"
        echo ""
        read -p "Press Enter to continue..."
    else
        echo -e "${RED}❌ .env.docker template not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi
echo ""

# Ask user what to do
echo "What would you like to do?"
echo "1) Start all services (first time)"
echo "2) Start all services (already set up)"
echo "3) Stop all services"
echo "4) View logs"
echo "5) Reset everything (DELETES ALL DATA)"
echo "6) Run database migrations"
echo "7) Seed database (production script)"
echo "8) Force reseed database (clears existing data)"
echo ""
read -p "Enter choice [1-8]: " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}🚀 Starting services for the first time...${NC}"
        docker-compose up -d --build
        
        echo ""
        echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
        sleep 10
        
        echo ""
        echo -e "${GREEN}📦 Running database migrations...${NC}"
        docker-compose exec app npx prisma migrate deploy
        
        echo ""
        echo -e "${GREEN}🌱 Seeding database (production script)...${NC}"
        docker-compose --profile seed run --rm seed
        
        echo ""
        echo -e "${GREEN}✅ Setup complete!${NC}"
        ;;
    2)
        echo ""
        echo -e "${GREEN}🚀 Starting services...${NC}"
        docker-compose up -d
        ;;
    3)
        echo ""
        echo -e "${YELLOW}🛑 Stopping services...${NC}"
        docker-compose stop
        echo -e "${GREEN}✅ Services stopped${NC}"
        ;;
    4)
        echo ""
        echo -e "${GREEN}📋 Showing logs (Ctrl+C to exit)...${NC}"
        docker-compose logs -f
        ;;
    5)
        echo ""
        echo -e "${RED}⚠️  WARNING: This will delete all data!${NC}"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo ""
            echo -e "${YELLOW}🗑️  Removing all containers and volumes...${NC}"
            docker-compose down -v
            echo -e "${GREEN}✅ Everything removed${NC}"
        else
            echo "Cancelled"
        fi
        ;;
    6)
        echo ""
        echo -e "${GREEN}📦 Running database migrations...${NC}"
        docker-compose exec app npx prisma migrate deploy
        echo -e "${GREEN}✅ Migrations complete${NC}"
        ;;
    7)
        echo ""
        echo -e "${GREEN}🌱 Seeding database (production script)...${NC}"
        docker-compose --profile seed run --rm seed
        echo -e "${GREEN}✅ Database seeded${NC}"
        ;;
    8)
        echo ""
        echo -e "${RED}⚠️  WARNING: This will clear existing data and reseed!${NC}"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo ""
            echo -e "${YELLOW}🗑️  Force reseeding database...${NC}"
            FORCE_SEED=true docker-compose --profile seed run --rm seed
            echo -e "${GREEN}✅ Database reseeded${NC}"
        else
            echo "Cancelled"
        fi
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "======================================"
echo -e "${GREEN}📡 Your API is available at:${NC}"
echo "   REST API:   http://localhost:3000/api/v1"
echo "   GraphQL:    http://localhost:3000/graphql"
echo "   Swagger:    http://localhost:3000/api-docs"
echo "   Health:     http://localhost:3000/health"
echo ""
echo -e "${YELLOW}📝 Useful commands:${NC}"
echo "   docker-compose logs -f        # View logs"
echo "   docker-compose ps             # Check status"
echo "   docker-compose stop           # Stop services"
echo "   docker-compose down           # Stop and remove"
echo ""