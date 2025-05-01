```markdown
# Crypto Chart App

Welcome to the Crypto Chart App! This is a mobile app for viewing cryptocurrency price charts on your iPhone or Android device. You can switch between Line and Candlestick charts, choose USD or AED currencies, zoom in/out, and select different time periods (1 day, 7 days, 30 days, 1 year, or all data).

This guide will help you set up and test the app, even if you're not very technical. Follow the steps carefully, and you’ll have the app running in no time!

## What the App Does
- **Charts**: View prices as a Line chart (a simple line) or Candlestick chart (bars showing price changes).
- **Toggle Button**: Switch between Line and Candlestick charts with one button (starts with Line).
- **Currencies**: See prices in USD (e.g., `$100.00`) or AED (e.g., `AED 100.00`).
- **Time Periods**: Choose 1 day, 7 days, 30 days, 1 year, or all available data.
- **Zoom**: Use + and − buttons to zoom in/out, with a vibration effect for feedback.
- **Design**: Works on iPhones and Android phones, with price labels on the right and dates at the bottom.

## What You’ll Need
- A **computer** (Windows, Mac, or Linux) to set up the app.
- A **smartphone** (iPhone or Android) to test the app.
- An **internet connection** for downloading tools and running the app.
- About **30 minutes** to set up everything.

## Step-by-Step Setup
### 1. Install Required Tools
You need a few free tools to run the app. Don’t worry, we’ll guide you!

#### Install Node.js
- **Node.js** lets the app run on your computer.
- Go to [nodejs.org](https://nodejs.org/) and download the **LTS version** (e.g., 16.x or 18.x).
- Run the installer and follow the prompts (click “Next” for defaults).
- After installation, open a **Command Prompt** (Windows) or **Terminal** (Mac/Linux) and type:
  ```bash
  node --version
  ```
- You should see a version number (e.g., `v18.12.0`). If not, reinstall Node.js.

#### Install Expo Go App
- **Expo Go** is an app to test the project on your phone.
- On your **iPhone**, download **Expo Go** from the [App Store](https://apps.apple.com/us/app/expo-go/id982107779).
- On your **Android**, download **Expo Go** from the [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent).
- Open the app to make sure it’s installed.

#### Install Expo CLI
- **Expo CLI** is a tool to start the app.
- In your Command Prompt or Terminal, type:
  ```bash
  npm install -g expo-cli
  ```
- Wait for it to finish (may take a few minutes).
- Check it worked by typing:
  ```bash
  expo --version
  ```
- You should see a version number (e.g., `6.0.0`). If not, try the command again.

### 2. Get the App Files
You can download the app files in two ways. Choose the easier one for you:

#### Option 1: Download as a ZIP File (Easiest)
- Go to [https://github.com/your-username/my-crypto-app](https://github.com/your-username/my-crypto-app).
- Click the green **Code** button and select **Download ZIP**.
- Unzip the file to a folder on your computer (e.g., `Desktop/my-crypto-app`).
- Open Command Prompt/Terminal and navigate to the folder:
  ```bash
  cd Desktop/my-crypto-app
  ```

#### Option 2: Use Git (If Comfortable)
- Install **Git** from [git-scm.com](https://git-scm.com/downloads) if not already installed.
- In Command Prompt/Terminal, type:
  ```bash
  git clone https://github.com/your-username/my-crypto-app.git
  cd my-crypto-app
  ```
- Replace `your-username` with the GitHub username of the project owner.

### 3. Set Up the App
- In Command Prompt/Terminal, while in the `my-crypto-app` folder, type:
  ```bash
  npm install
  ```
- This downloads the app’s required libraries (takes a few minutes).
- If you see errors, try:
  ```bash
  npm install --force
  ```

### 4. Run the App
- Start the app by typing:
  ```bash
  npx expo start
  ```
- A browser window or terminal will show a **QR code**.
- On your phone:
  - Open the **Expo Go** app.
  - Scan the QR code (iPhone: use Camera app; Android: use Expo Go’s scanner).
- The app should load on your phone within a minute.
- If the QR code doesn’t work:
  - Ensure your phone and computer are on the **same Wi-Fi network**.
  - Try:
    ```bash
    npx expo start --clear
    ```

### 5. Test the App
Once the app is running on your phone, try these features:
- **Toggle Button**:
  - See a button with “Line” and “Candlestick”. It starts on “Line” (blue background).
  - Tap it to switch to “Candlestick” (shows bars). Tap again to go back to “Line”.
  - Feel a slight vibration when you tap.
- **Currency Dropdown**:
  - Tap the currency dropdown (says “USD” or “AED”).
  - Choose “USD” or “AED”. Prices should change (e.g., `$100.00` or `AED 100.00`).
- **Time Period Dropdown**:
  - Tap the time dropdown (e.g., “30D”).
  - Choose “1D”, “7D”, “30D”, “1Y”, or “All”. The chart should update.
- **Zoom Buttons**:
  - Tap `+` to zoom in, `−` to zoom out. Feel a vibration each time.
- **Chart**:
  - Look at the chart. Prices (y-axis) are on the right, dates (x-axis) at the bottom, both tilted.
  - Ensure labels are clear and not cut off.
- **Loading**:
  - When switching time periods, you may see a loading spinner.
  - If no data shows, it might say “No data available”.

### Notes About the Data
The app tries to get price data from an online service (`https://coingeko.burjx.com/coin-ohlc`). If this doesn’t work (e.g., shows “No data available”), you can use **sample data** to test the app:

1. Open the `CoinDetailsScreen.tsx` file in a text editor (e.g., Notepad, VS Code).
2. Find the `fetchCoinData` function (around line 50).
3. Replace the `try` block with this sample data:
   ```typescript
   try {
     const mockOhlcData = [
       { date: Date.now() - 86400000 * 2, usd: { open: 100, high: 110, low: 90, close: 105 }, aed: { open: 367, high: 404, low: 331, close: 386 } },
       { date: Date.now() - 86400000, usd: { open: 105, high: 115, low: 95, close: 110 }, aed: { open: 386, high: 422, low: 349, close: 404 } },
       { date: Date.now(), usd: { open: 110, high: 120, low: 100, close: 115 }, aed: { open: 404, high: 441, low: 367, close: 422 } },
     ];
     const newOhlcData = mockOhlcData.map((item) => ({
       timestamp: item.date,
       open: item[currencyType]?.open ?? item.usd.open,
       high: item[currencyType]?.high ?? item.usd.high,
       low: item[currencyType]?.low ?? item.usd.low,
       close: item[currencyType]?.close ?? item.usd.close,
     }));
     setCoinData({ name: "Sample Coin", productId: "sample", currentPrice: 115, marketCap: 1000000 });
     setOhlcData(newOhlcData);
   } catch (error) {
     console.error('Error with mock data:', error);
     setOhlcData((prev) => prev);
   } finally {
     setIsLoadingData(false);
   }
   ```
4. Save the file and restart the app:
   ```bash
   npx expo start
   ```
5. The app will now show a sample chart with three days of data.

### Troubleshooting
If something doesn’t work, try these fixes:
- **App Won’t Start**:
  - Make sure you ran `npm install`.
  - Try clearing the cache:
    ```bash
    npx expo start --clear
    ```
- **QR Code Fails**:
  - Check that your phone and computer are on the same Wi-Fi.
  - In the Expo interface, click “Tunnel” instead of “LAN” and scan the new QR code.
- **No Data Shows**:
  - Use the sample data above.
  - Contact the project owner for access to the data service.
- **Errors During Setup**:
  - If `npm install` fails, try:
    ```bash
    npm install --force
    ```
  - If you see “command not found” for `expo`, reinstall Expo CLI:
    ```bash
    npm install -g expo-cli
    ```
- **Labels Cut Off**:
  - The chart should have price labels on the right and dates at the bottom. If they’re not visible, contact the project owner to adjust the layout.

### Questions?
If you get stuck, contact the project owner (GitHub username: your-username) or ask a tech-savvy friend for help. You can also check the [Expo documentation](https://docs.expo.dev/) for more details.

## License
This project is shared under the [MIT License](LICENSE) (or contact the owner for details).

---
Happy charting! 🚀
```