import { storefrontApiClient } from '../utils/storefrontApiClient';

export const fetchCollection = async (collectionID: string, cursor: string | null, limit: number) => {
  // const numToFetch = initialCount ? initialCount : 100;
  // console.log(numToFetch);

  try {
    // console.log(collectionID)
    const query = `
      query($collectionID: ID!, $cursor: String, $limit: Int!) {
        collection(id: $collectionID) {
          id
          title
          products(first: $limit, after: $cursor) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
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
              images(first: 10) {
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
              variants(first: 200) {
                nodes {
                  availableForSale
                  selectedOptions {
                    value
                  }
                }
              }
            }
          }
        }
      }
    `;

    const variables = {
      collectionID: collectionID,
      cursor: cursor,
      limit: limit,

      // collectionID: `gid://shopify/Collection/${collectionID}`,
      // numToFetch,
    };

    const response: any = await storefrontApiClient(query, variables);

    if (response.errors && response.errors.length !== 0) {
      throw new Error(response.errors[0].message);
    }

    // console.log(response ? response : "we got nothing burh!!!!");

    // const products = response.data.collection.products.nodes;
    // // console.log(products);
    // console.log(response.data.collection.products.pageInfo);
    const products = response.data.collection.products.nodes;
    const hasNextPage = response.data.collection.products.pageInfo.hasNextPage;
    const endCursor = response.data.collection.products.pageInfo.endCursor;

    return { products, hasNextPage, endCursor };
  } catch (error) {
    console.error('Error fetching collection:', error);
    throw error;
  }
};

// import { storefrontApiClient } from '../utils/storefrontApiClient';

// export const fetchCollection = async (collectionID: string, initialCount?: number) => {
//     const numToFetch = initialCount ? initialCount : 100;
//     console.log(collectionID)
//     try {
//         const query = `
//         query($collectionID: ID!, $numToFetch: Int!) {
//           collection(id: "${collectionID}") {
//             id
//             title
//             products(first: $numToFetch) {
//               nodes {
//                 id
//                 title
//                 description
//                 vendor
//                 availableForSale
//                 compareAtPriceRange {
//                   minVariantPrice {
//                     amount
//                     currencyCode
//                   }
//                 }
//                 priceRange {
//                   minVariantPrice {
//                     amount
//                     currencyCode
//                   }
//                 }
//                 images(first: 10) {
//                   nodes {
//                     url
//                     width
//                     height
//                   }
//                 }
//                 options {
//                   id
//                   name
//                   values
//                 }
//                 variants(first: 200) {
//                   nodes {
//                     availableForSale
//                     selectedOptions {
//                       value
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       `
//         const variables = {
//             collectionID: `gid://shopify/Collection/${collectionID}`,
//             numToFetch,
//         };

//         const response: any = await storefrontApiClient(query, variables);

//         if (response.errors && response.errors.length !== 0) {
//             throw new Error(response.errors[0].message);
//         }
//         console.log(response ? (response) : ("we got nothing burh!!!!"));
//         const products = response.data.collection.products.nodes;
//         console.log(products);
//         return products;
//     } catch (error) {
//         console.error('Error fetching collection:', error);
//         throw error;
//     }
// };