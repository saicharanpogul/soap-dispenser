const { execSync } = require("child_process");
const idl = require("../target/idl/soap_dispenser.json");

const initIdl = () => {
  try {
    execSync(
      `anchor idl init --filepath ./target/idl/soap_dispenser.json ${idl.metadata.address}`,
      { stdio: "inherit" }
    );
  } catch (error) {
    console.log(error);
  }
};

initIdl();
