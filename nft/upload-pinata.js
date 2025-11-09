import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";

const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2N2NjMGZiOS1iZWExLTRkNWEtYjIxYS00ZmNlYzZhNWFmYTIiLCJlbWFpbCI6Im1hdWxhbmFyZXphZ2FtZTA4QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIwY2JjYWU0YTY2MThjOTFmOWZlYSIsInNjb3BlZEtleVNlY3JldCI6IjFiOWEyZmVmNTRlZDQ2OWU4NGZhZDgzNzg1YWNkZTA2Y2YwN2E3NDkzNTlkNzYxODQxOWUzN2EzYjQ3ZWY0ZTciLCJleHAiOjE3OTQyNDUxODh9.qifwE7vOr6MWS_m-1EJZ1cxxyQVfZCEYvKNoL1a7IdM"; // ganti dengan JWT dari dashboard Pinata

// Upload satu file ke Pinata
async function uploadFileToIPFS(filePath) {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));

  const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
    maxBodyLength: Infinity,
    headers: {
      "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
      Authorization: `Bearer ${JWT}`,
    },
  });

  const hash = res.data.IpfsHash;
  console.log(`✅ Uploaded: ${path.basename(filePath)} → ipfs://${hash}`);
  return `ipfs://${hash}`;
}

// Upload JSON metadata ke Pinata
async function uploadJSONToIPFS(jsonData, name) {
  const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", jsonData, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JWT}`,
    },
  });
  const hash = res.data.IpfsHash;
  console.log(`🧾 Metadata ${name}.json → ipfs://${hash}`);
  return `ipfs://${hash}`;
}

// Main process
async function main() {
  const imageFolder = "./nft/images";
  const metaFolder = "./nft/metadata";
  if (!fs.existsSync(metaFolder)) fs.mkdirSync(metaFolder);

  const files = fs.readdirSync(imageFolder);
  const metadataURIs = [];

  console.log("🚀 Starting upload to Pinata...\n");

  for (const file of files) {
    const filePath = path.join(imageFolder, file);
    const imageURI = await uploadFileToIPFS(filePath);

    const id = path.basename(file, path.extname(file));
    const metadata = {
      name: `Wolfplet #${id}`,
      description: "Exclusive Wolfplet NFT on Base",
      image: imageURI,
      attributes: [
        { trait_type: "Faction", value: "Alpha" },
        { trait_type: "Rarity", value: "Legendary" },
      ],
    };

    fs.writeFileSync(`${metaFolder}/${id}.json`, JSON.stringify(metadata, null, 2));
    const metadataURI = await uploadJSONToIPFS(metadata, id);
    metadataURIs.push(metadataURI);
  }

  console.log("\n✨ All NFT metadata uploaded successfully!");
  console.log("🧩 Use these URIs for your contract setURIs():");
  console.log(metadataURIs);
}

main().catch((err) => console.error(err));
