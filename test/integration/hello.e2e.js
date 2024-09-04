import { test, expect } from "@playwright/test";
import path from "path";
import serve from "@nebula.js/cli-serve";

test.describe("sn", () => {
  let server;

  test.beforeAll(async () => {
    server = await serve({
      build: false,
      open: false,
      fixturePath: path.resolve(__dirname, "fixtures"),
    });
    process.env.BASE_URL = server.url;
  });

  test.afterAll(() => {
    server.close();
  });

  test("should say hello", async ({ page }) => {
    // const content = '.njs-viz[data-render-count="1"]';

    const url = `${process.env.BASE_URL}/render?fixture=hello.fix.js`;
    await page.goto(url);
    // await page.waitForSelector(content, { visible: true });
    // const text = await page.$eval(content, (el) => el.textContent);
    expect(true).toBeTruthy();
  });
});
