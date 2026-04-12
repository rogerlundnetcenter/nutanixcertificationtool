#!/bin/bash
# Project validation script

echo "=== Nutanix Certification Tool - Project Validation ==="
echo ""

# Check for required files
echo "Checking required files..."
REQUIRED_FILES=(
    "NutanixCertificationTool.sln"
    "CertStudy.Maui/CertStudy.Maui.csproj"
    "CertStudy.Maui/MauiProgram.cs"
    "CertStudy.Maui/Data/AppDbContext.cs"
    "CertStudy.Maui/Components/Routes.razor"
    "CertStudy.Maui/Components/Layout/MainLayout.razor"
    "CertStudy.Maui/wwwroot/index.html"
    "CertStudy.Maui/wwwroot/css/app.css"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ MISSING: $file"
    fi
done

echo ""
echo "=== File Size Audit ==="
find CertStudy.Maui -type f \( -name "*.cs" -o -name "*.razor" \) -exec sh -c '
    lines=$(wc -l < "$1")
    if [ $lines -gt 500 ]; then
        echo "  ❌ $lines $1 (EXCEEDS 500)"
    elif [ $lines -gt 300 ]; then
        echo "  ⚠️  $lines $1 (>300)"
    fi
' _ {} \;

echo ""
echo "=== Statistics ==="
echo "  C# Files: $(find CertStudy.Maui -name '*.cs' | wc -l)"
echo "  Razor Files: $(find CertStudy.Maui -name '*.razor' | wc -l)"
echo "  Total Lines: $(find CertStudy.Maui \( -name '*.cs' -o -name '*.razor' \) -exec cat {} + 2>/dev/null | wc -l)"

echo ""
echo "=== Git Status ==="
git log --oneline -5 2>/dev/null || echo "  No git history"

echo ""
echo "=== Next Steps ==="
echo "1. Restore packages: dotnet restore NutanixCertificationTool.sln"
echo "2. Install libman: dotnet tool install -g Microsoft.Web.LibraryManager.Cli"
echo "3. Restore client libs: libman restore"
echo "4. Build: dotnet build NutanixCertificationTool.sln"
echo "5. Run: dotnet run --project CertStudy.Maui/CertStudy.Maui.csproj"
