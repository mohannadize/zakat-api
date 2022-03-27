# Zakat Calculator API

This is a simple server that provides a simple API to calculate the qualify amount of Zakat

## Setup

```sh
npm install
```

then

```sh
npm start
```

## API

Default Currency

GET `/`

```json
{
  "zakatGold": 4681.8, // Carat 21 Price * 85
  "zakatSilver": 487.9, // Silver Price * 595
  "goldPrice": 55.08, // Carat 21 Gold
  "silverPrice": 0.82, // Pure Silver Price
  "currency": "USD",
  "lastUpdated": "2022-03-27T17:36:18.186Z"
}
```

Specific Currency

GET `/currency/EGP`

```json
{
  "zakatGold": 4681.8,
  "zakatSilver": 487.9,
  "goldPrice": 55.08,
  "silverPrice": 0.82,
  "currency": "EGP",
  "lastUpdated": "2022-03-27T17:36:18.186Z"
}
```

## Services Used

- [Goldapi.io](https://goldapi.io)
