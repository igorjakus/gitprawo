#!/bin/bash

# Script to download the Civil Code PDF from ISAP
# It downloads the PDF to the 'output/' directory as 'kodeks.pdf'

echo "Downloading Kodeks Cywilny PDF from ISAP..."
curl -L -o ../output/kodeks.pdf "https://isap.sejm.gov.pl/isap.nsf/download.xsp/WDU19640160093/U/D19640093Lj.pdf"

if [ $? -eq 0 ]; then
    echo "Successfully downloaded ../output/kodeks.pdf"
else
    echo "Error downloading PDF"
fi
