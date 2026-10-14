# BetaAppBCST

React Native (Expo) web3 dApp prototype that connects a mobile wallet through WalletConnect Web3Modal and talks to smart contracts on **BNB Smart Chain Testnet**. It started from Callstack's [web3-react-native-dapp-wagmi](https://github.com/callstack/web3-react-native-dapp-wagmi) example.

## What it does

- Connects a wallet (MetaMask, Rainbow, Trust and others) with Web3Modal.
- Shows the current block number and gas price, plus the connected address and balance.
- Has a **"Check Allowance and Proceed"** button (`src/components/WalletActions.tsx`) that:
  1. reads the token `allowance` that the connected address has granted to a hardcoded spender contract;
  2. if the allowance is below 20 tokens, sends an `approve` transaction for 20 tokens;
  3. otherwise calls `receiveUSDT(20)` on the spender contract.

The token and spender contract addresses are hardcoded in `WalletActions.tsx`.

## Tech stack

- [Expo](https://expo.dev/) SDK 49, React Native 0.72, TypeScript
- [wagmi](https://wagmi.sh/) v1 and [viem](https://viem.sh/) v1
- [@web3modal/wagmi-react-native](https://docs.walletconnect.com/) with `@walletconnect/react-native-compat`
- ESLint (`@callstack/eslint-config`) and Prettier

## Project structure

```
App.tsx                         # wagmi + Web3Modal setup (bscTestnet), renders HomePage
src/
  pages/HomePage.tsx            # Connect button, chain info, account info
  components/
    WalletActions.tsx           # Allowance check, approve, receiveUSDT
    WalletActions copy.tsx      # Older variant of WalletActions
    abi.ts, abiII.ts            # Contract ABIs
assets/                         # App icons and splash
app.json                        # Expo config
```

## Getting started

Requirements: the [Expo environment](https://docs.expo.dev/get-started/installation/), the Expo Go app on a phone, and a wallet app on that phone with BSC Testnet funds.

```bash
npm install
npm start          # or: npm run android / npm run ios
```

Then scan the QR code in Expo Go.

## Environment variables

Put this in a `.env` file. `.env` is in `.gitignore`.

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_WALLETCONNECT_CLOUD_PROJECT_ID` | WalletConnect Cloud project ID used by Web3Modal |

## Notes

- The dApp metadata in `App.tsx` still has the example's placeholder values (name, URL, redirect scheme).
