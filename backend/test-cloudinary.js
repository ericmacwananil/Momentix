const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dfylhohm6',
  api_key: '126474777889369',
  api_secret: 'I9bavaTO6EJTt_KWgs6-rvzzEGE'
});

async function testCloudinary() {
  try {
    // 1. Upload a sample image
    console.log('Uploading sample image...');
    const uploadResult = await cloudinary.uploader.upload(
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      { folder: 'momentix-test' }
    );
    console.log('\n✅ Uploaded successfully!');
    console.log('Secure URL:', uploadResult.secure_url);
    console.log('Public ID:', uploadResult.public_id);

    // 2. Get image details
    console.log('\nFetching image details...');
    const imageDetails = await cloudinary.api.resource(uploadResult.public_id);
    console.log('\n📸 Image Metadata:');
    console.log('Width:', imageDetails.width);
    console.log('Height:', imageDetails.height);
    console.log('Format:', imageDetails.format);
    console.log('File size (bytes):', imageDetails.bytes);

    // 3. Generate transformed image URL
    // f_auto: Automatically selects the best format (WebP, AVIF, etc.)
    // q_auto: Automatically optimizes quality for web display
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      transformation: [
        { fetch_format: 'auto', quality: 'auto' }
      ]
    });
    console.log('\n✨ Done! Click the link to see the optimized image:');
    console.log(transformedUrl);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testCloudinary();
