const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log("Deploying PayLink...");
  const PayLink = await hre.ethers.getContractFactory("PayLink");
  const payLink = await PayLink.deploy();
  await payLink.waitForDeployment();
  const plAddress = await payLink.getAddress();

  console.log("Deploying DemoPaymaster...");
  const DemoPaymaster = await hre.ethers.getContractFactory("DemoPaymaster");
  const paymaster = await DemoPaymaster.deploy();
  await paymaster.waitForDeployment();
  const pmAddress = await paymaster.getAddress();

  // Write addresses to file so they don't get truncated
  const fs = require("fs");
  const output = `PAYLINK_ADDRESS=${plAddress}\nPAYMASTER_ADDRESS=${pmAddress}\n`;
  fs.writeFileSync("deployed_addresses.txt", output);
  console.log("Addresses written to deployed_addresses.txt");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
