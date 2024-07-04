const puppeteer = require('puppeteer');

(async () => {
  // Launch browser instance
  const browser = await puppeteer.launch({
    headless: false, // Set to false to see the browser window
    args: ['--remote-debugging-port=9222']
  });
  
  // Get a list of all open tabs
  const pages = await browser.pages();
  
  for (const page of pages) {
    const url = page.url();
    const title = await page.title();
    console.log(`Tab: ${title} - ${url}`);
    
    // Get performance metrics
    const performanceTiming = JSON.parse(
      await page.evaluate(() => JSON.stringify(window.performance.timing))
    );
    console.log(`Performance Metrics for ${title}:`, performanceTiming);

    // Get network data (simplified example)
    const response = await page.goto(url);
    const headers = response.headers();
    console.log(`Network Data for ${title}:`, headers);
  }

  await browser.close();
})();
