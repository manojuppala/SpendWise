#!/bin/bash

echo "🚀 SpendWise - Initial Setup"
echo "=============================="
echo ""

# Check if config files already exist
if [ -f "config/supabase.ts" ]; then
    echo "⚠️  config/supabase.ts already exists!"
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
        echo "Skipping supabase.ts..."
    else
        cp config/supabase.example.ts config/supabase.ts
        echo "✅ Created config/supabase.ts from example"
    fi
else
    cp config/supabase.example.ts config/supabase.ts
    echo "✅ Created config/supabase.ts from example"
fi

if [ -f "constants/index.ts" ]; then
    echo "⚠️  constants/index.ts already exists!"
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
        echo "Skipping index.ts..."
    else
        cp constants/index.example.ts constants/index.ts
        echo "✅ Created constants/index.ts from example"
    fi
else
    cp constants/index.example.ts constants/index.ts
    echo "✅ Created constants/index.ts from example"
fi

echo ""
echo "📝 Next Steps:"
echo "1. Edit config/supabase.ts and add your Supabase credentials"
echo "2. Edit constants/index.ts and add your Cloudinary credentials (optional)"
echo "3. Run: npm install --legacy-peer-deps"
echo "4. Run: npm start"
echo ""
echo "📚 For detailed instructions, see:"
echo "   - SECURITY.md (security guidelines)"
echo "   - SUPABASE_SETUP.md (Supabase setup guide)"
echo ""
echo "⚠️  IMPORTANT: Never commit your actual credentials to Git!"
echo "    The config files are in .gitignore for your protection."
