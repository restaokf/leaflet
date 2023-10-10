// Centered the location
Map.centerObject(geometry, 13);
Map.setOptions('satellite');

// 2.1) Cloud Masking
////////////////////
//Sentinel data includes a 'pixel_qa' band which can be used to create 
//     a function to mask clouds
function maskS2clouds(image) {
  var qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return image.updateMask(mask).divide(10000);
}

//Date filter
var year = 2022;
var StartDate = '2022-05-01';
var endDate = '2022-08-01';

//melakukan filter data dasarkan tanggal dan tutupan awan kurang dari 20
var s2 = S2.filterDate(StartDate, endDate)
          .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
          .map(maskS2clouds);

//melakukan komposite median, kemudian dilakukan clip berdasarkan geometrynya
var composite = s2.median().clip(geometry);

//Display Result
//Select Band and parameter for visualization
var visPar = {bands:['B4', 'B3', 'B2'], min:0, max:0.35};

//Add Layer
Map.addLayer(composite, visPar, 'Sentinel 2 2020');
Map.centerObject(geometry, 12);


//BEGINNING THE COMPUTATION

//memilih variabel
var variables =['B1', 'B2', 'B3', 'B4', 'B5', 'B6'];

//Membuat ROI 
var habitat = outer.difference(inner);
Map.addLayer(habitat, { color: 'yellow'}, 'Habitat');

//Mask Image
var habitatImage = composite.clip(habitat);
Map.addLayer(habitatImage, visPar, 'S2 Image Clipped');

//Marge Sample
var sample = Coral.merge(Seagrass).merge(Sand).merge(Algae).randomColumn();

//Split Sample
var training = sample.filter(ee.Filter.lte('random', 0.8));
var test = sample.filter(ee.Filter.lte('random', 0.8));

// Extract value from image
var trainingSample = habitatImage.sampleRegions({
  collection: training,
  scale: 15,
  properties: ['class']
});
var testSample = habitatImage.sampleRegions({
  collection: test,
  scale: 15,
  properties: ['class']
});
print('Training sample', trainingSample.size(), 'Test sample', testSample.size());

// Random forest model (50 itu kris, semakin banyak citra akan semakin tinggi)
var model = ee.Classifier.smileRandomForest(50).train(trainingSample, 'class', variables);

// Check accuracy
var testClassify = testSample.classify(model, 'predicted_class').errorMatrix('class', 'predicted_class');
print('Confusion matrix', testClassify, 'Overall accuracy', testClassify.accuracy());

// Show the classificaiton result
var benthic = habitatImage.classify(model, 'benthic')
  .set('benthic_class_values', [1, 2, 3, 4], 'benthic_class_palette', ['01882d', 'ffac23', 'ffe448', 'f2b6ff']);
Map.addLayer(benthic, {}, 'Benthic');

//8.2) Export Image to Drive
//------------------
Export.image.toDrive({
  image: benthic,
  description: 'GEE_Benthic',
  region: geometry,
  scale: 15,
  maxPixels: 1e13
  });
  
  