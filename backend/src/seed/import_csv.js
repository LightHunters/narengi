const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const importCsvToJson = async () => {
  try {
    const results = [];
    const csvPath = path.join(__dirname, '../../../results.csv');
    const jsonPath = path.join(__dirname, 'imported_cafes.json');

    if (!fs.existsSync(csvPath)) {
        console.error('CSV file not found at:', csvPath);
        process.exit(1);
    }

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        let images = [];
        try {
            if (data.images && data.images.startsWith('[')) {
                 const parsed = JSON.parse(data.images);
                 images = parsed.map(img => img.image).filter(i => i);
            }
        } catch (e) {}

        let open_hours = {};
        try {
            if (data.open_hours && data.open_hours.startsWith('{')) {
                open_hours = JSON.parse(data.open_hours);
            }
        } catch (e) {}

        results.push({
          name: data.title,
          address: data.address,
          lat: parseFloat(data.latitude),
          lng: parseFloat(data.longitude),
          rating: parseFloat(data.review_rating) || 0,
          place_id: data.data_id || data.input_id || Math.random().toString(36),
          category: data.category,
          phone: data.phone,
          website: data.website,
          thumbnail: data.thumbnail,
          images: images,
          open_hours: open_hours
        });
      })
      .on('end', () => {
        console.log(`Parsed ${results.length} records.`);
        fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
        console.log(`Saved to ${jsonPath}`);
      });

  } catch (error) {
    console.error('Import error:', error);
    process.exit(1);
  }
};

importCsvToJson();
