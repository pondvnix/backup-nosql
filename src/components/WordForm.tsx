// Replace the onAddWord prop type on line 286-287 to match the expected signature
// Change from:
// onAddWord={(word, template) => {
// To:
onAddWord={(word: string) => {
  // Make sure to handle the proper implementation inside the function
  // without using the template parameter that caused the error
