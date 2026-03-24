const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log("=".repeat(50));
  console.log(`Network:  ${network}`);
  console.log(`Deployer: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Balance:  ${hre.ethers.formatEther(balance)} SHM`);
  console.log("=".repeat(50));

  // ── Deploy PayLink ─────────────────────────────────────────────────
  console.log("\n[1/2] Deploying PayLink...");
  const PayLink = await hre.ethers.getContractFactory("PayLink");
  const payLink = await PayLink.deploy();
  await payLink.waitForDeployment();
  const plAddress = await payLink.getAddress();
  console.log(`  PayLink deployed to: ${plAddress}`);

  // ── Deploy DemoPaymaster ─────────────────────────────────────────────────
  console.log("\n[2/2] Deploying DemoPaymaster...");
  const DemoPaymaster = await hre.ethers.getContractFactory("DemoPaymaster");
  const paymaster = await DemoPaymaster.deploy();
  await paymaster.waitForDeployment();
  const pmAddress = await paymaster.getAddress();
  console.log(`  DemoPaymaster deployed to: ${pmAddress}`);

  // ── Summary ──────────────────────────────────────────────────────────────
  const explorerBase =
    network === "shardeum_mainnet"
      ? "https://explorer.shardeum.org"
      : "https://explorer-mezame.shardeum.org";

  console.log("\n" + "=".repeat(50));
  console.log("Deployment complete!");
  console.log(`  PayLink: ${explorerBase}/address/${plAddress}`);
  console.log(`  DemoPaymaster: ${explorerBase}/address/${pmAddress}`);
  console.log("=".repeat(50));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
