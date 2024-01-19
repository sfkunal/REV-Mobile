export const getProductInfoQuery = (productId: string) => `
  query {
    product(id: "gid://shopify/Product/${productId}") {
      id
      title
      description
      vendor
      availableForSale
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 1) {
        nodes {
          url
          width
          height
        }
      }
      options {
        id
        name
        values
      }
      variants(first: 10) {
        nodes {
          availableForSale
          selectedOptions {
            value
          }
        }
      }
    }
  }
`;
