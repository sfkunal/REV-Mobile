# REV Mobile App

## Table of Contents

- [Introduction](#introduction)
- [Technology Stack](#technology-stack)
- [Development Features](#development-features)
  - [Customer Accounts](#customer-accounts)
  - [Store Selection](#store-selection)
  - [Streamlined Account Login/Creation/Checkout](#streamlined-account-logincreationcheckout)
  - [Geofencing](#geofencing)
  - [Address Autocomplete](#address-autocomplete)
  - [Personalized Recommendations and Reordering](#personalized-recommendations-and-reordering)
  - [Smart Fees](#smart-fees)
- [Design](#design)
- [Scalability](#scalability)
- [Potential Development Plan](#potential-development-plan)
- [Contact](#contact)

## Introduction

REV Mobile is a delivery application developed with a React Native TypeScript frontend, integrated with a Shopify GraphQL backend. This README provides technical details about the app, its features, and the development approach.

## Technology Stack

- **Frontend**: React Native (TypeScript)
- **Backend**: Shopify GraphQL API
- **Cloud Provider**: Options include AWS, Azure, GCP (for potential future custom backend solutions)
- **APIs and Plugins**: 
  - Twilio Verify API (for OTP-based login)
  - Google Places API (for address autocomplete)
  - Shopify Customer Accounts

## Development Features

### Customer Accounts

#### Shopify Customer Accounts

REV Mobile leverages Shopify's built-in customer accounts to handle user authentication and account management. This includes:

- Order history
- Saved addresses
- Reordering capabilities

For more details, refer to [Shopify Customer Accounts](https://help.shopify.com/en/manual/customers/customer-accounts).

#### Custom Backend (Optional)

A custom backend using cloud providers like Azure or GCP can be implemented for ultimate customizability. This would involve:

- Storing user data (name, email, order history, saved addresses)
- Managing REV store data (location, inventory, geofencing radius)

### Store Selection

The app will use the Shopify backend to fetch information about store locations, inventory, and geofencing details. This information will be presented to users, allowing them to select stores based on their preferences and geofencing constraints.

### Streamlined Account Login/Creation/Checkout

The React Native frontend will streamline the account management process. This includes:

- Seamless account creation and login
- Minimal friction in the checkout process
- Integration with Twilio Verify API for OTP-based login

### Geofencing

Geofencing will be used to ensure that orders are placed within a specific radius of a REV store. Users outside the predefined radius will receive notifications about delivery limitations.

### Address Autocomplete

The address autocomplete feature will use the Google Places API to provide real-time address suggestions, enhancing the user experience and reducing input errors.

### Personalized Recommendations and Reordering

Based on a user's order history, the app will generate personalized recommendations. A reordering feature will also be available to streamline the purchasing process for frequent customers.

### Smart Fees

The app will implement smart fee calculations, including:

- Higher delivery fees for longer distances
- Small cart fees to encourage larger orders

## Design

A strong user-centered design approach is crucial. Design features include:

- Store selection
- Item selection
- Geofencing block and redirect screen
- Ordering/cart screen
- Account creation
- Personalized recommendations
- Checkout screen

Designs will be developed collaboratively with a dedicated designer to ensure a seamless and delightful user experience.

## Scalability

Given the high user engagement and growth rate, the app must be designed for scalability. This includes:

- Utilizing React Native for cross-platform capabilities
- Leveraging cloud providers for backend infrastructure
- Monitoring and optimizing backend processes and server capabilities

## Potential Development Plan

1. **Design Phase**: Create pixel-perfect mockups and finalize the design.
2. **Development Phase**: Develop the app using React Native for both web and mobile platforms.
3. **Feature Implementation**: Implement additional features based on the design and development specifications.

## Contact

**Kunal Srivastava**  
Email: [kunal@masagroup.com](mailto:kunal@masagroup.com)  
Website: [https://sfkunal.me](https://sfkunal.me)
