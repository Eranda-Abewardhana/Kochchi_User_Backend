# Currency Integration with Real-Time Exchange Rates

This document explains how the application now integrates real-time USD to LKR exchange rates for pricing display while maintaining USD payments through Stripe.

## Overview

The application fetches real-time exchange rates from `https://api.exchangerate-api.com/v4/latest/USD` and displays prices in Sri Lankan Rupees (LKR) for user convenience, while ensuring Stripe payments are processed in USD.

## Key Features

### 1. Real-Time Exchange Rate Fetching
- **API**: `https://api.exchangerate-api.com/v4/latest/USD`
- **Caching**: Exchange rates are cached for 1 hour to reduce API calls
- **Fallback**: If API fails, uses cached rate or fallback rate of 302 LKR/USD

### 2. Currency Display
- **Primary Display**: Prices shown in LKR (e.g., Rs. 15,100.00)
- **Secondary Display**: USD equivalent shown in parentheses (e.g., ($50.00))
- **Exchange Rate Info**: Current rate displayed to users with explanation

### 3. Payment Processing
- **Stripe Integration**: Payments processed in USD (original amounts)
- **Backend Calculation**: Server calculates USD pricing based on add-on selections
- **No Currency Conversion in Payment**: Stripe receives exact USD amounts

## Implementation Details

### Currency Conversion Functions

```javascript
// Fetch current exchange rate with caching
const fetchExchangeRate = async () => { /* ... */ }

// Convert USD to LKR
const usdToLkr = async (usdAmount) => { /* ... */ }

// Convert LKR to USD  
const lkrToUsd = async (lkrAmount) => { /* ... */ }

// Format currency display
const formatLkr = (amount) => `Rs. ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const formatUsd = (amount) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
```

### Pricing State Management

```javascript
// USD pricing from API
const [pricing, setPricing] = useState({ base: 0, carousal: 0, top: 0, international: 0 });

// LKR equivalent pricing  
const [pricingLkr, setPricingLkr] = useState({ base: 0, carousal: 0, top: 0, international: 0 });

// Current exchange rate
const [exchangeRate, setExchangeRate] = useState(302);
```

### Error Handling

1. **API Failures**: Falls back to cached rates, then to hardcoded fallback rate
2. **Network Issues**: Graceful degradation with fallback rates
3. **Invalid Data**: Data validation ensures proper rate structure

### User Experience

1. **Loading State**: Shows "Updating rates..." while fetching
2. **Exchange Rate Display**: Current rate shown with explanation
3. **Dual Currency Display**: Both LKR and USD shown for transparency
4. **Payment Clarity**: Clear indication that payment is in USD via Stripe

## Sample API Response

```json
{
  "provider": "https://www.exchangerate-api.com",
  "base": "USD",
  "date": "2025-09-17",
  "time_last_updated": 1758067201,
  "rates": {
    "USD": 1,
    "LKR": 302,
    // ... other currencies
  }
}
```

## Benefits

1. **Real-Time Accuracy**: Always shows current market rates
2. **User Convenience**: Local currency display for Sri Lankan users
3. **Payment Reliability**: USD payments ensure consistent Stripe processing
4. **Fallback Reliability**: Multiple fallback mechanisms ensure app always works
5. **Performance**: Caching reduces API calls and improves response times

## Maintenance

- Monitor exchange rate API reliability
- Update fallback rate periodically if needed
- Consider adding rate change notifications if significant fluctuations occur
- Review caching duration based on volatility needs