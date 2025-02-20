import puppeteer from 'puppeteer';

export const searchGoogle = async (query: string) => {
  console.log(`🔍 Iniciando busca no Google por: "${query}"`);
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://www.google.com');
  await page.waitForSelector('textarea[name="q"]');

  await page.type('textarea[name="q"]', query);
  await page.keyboard.press('Enter');

  await page.waitForNavigation();
  console.log(`✅ Pesquisa concluída para: "${query}"`);

  await browser.close();
};
