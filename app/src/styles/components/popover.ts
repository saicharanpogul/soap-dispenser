import {
  createMultiStyleConfigHelpers,
  defineStyleConfig,
} from "@chakra-ui/react";

const helpers = createMultiStyleConfigHelpers([
  "popper",
  "header",
  "body",
  "footer",
]);

export default helpers.defineMultiStyleConfig({
  // Styles for the base style
  baseStyle: {
    popper: {
      border: "unset",
    },
    body: {
      backgroundColor: "background.100",
      color: "text.500",
    },
  },
  // Styles for the size variations
  sizes: {},
  // Styles for the visual style variations
  variants: {},
  // The default `size` or `variant` values
  defaultProps: {},
});
