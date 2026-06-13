import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const token = process.env.IG_ACCESS_TOKEN;

if (!token || token === 'your_long_lived_access_token') {
  console.error('❌ IG_ACCESS_TOKEN is missing or invalid in .env');
  process.exit(1);
}

async function fetchIgUserId() {
  try {
    console.log('Checking token permissions...');
    const permRes = await axios.get(`https://graph.facebook.com/v25.0/me/permissions?access_token=${token}`);
    console.log('Token Permissions:', permRes.data.data.map(p => p.permission + ' (' + p.status + ')').join(', '));
  } catch (err) {
    console.error('Failed to check permissions:', err.message);
  }

  try {
    console.log('Fetching Facebook Pages linked to this token...');
    const res = await axios.get(`https://graph.facebook.com/v25.0/me/accounts?fields=name,instagram_business_account&access_token=${token}`);
    const pages = res.data.data;

    if (!pages || pages.length === 0) {
      console.log('⚠️ No pages found under /me/accounts. Checking if this is already a Page Access Token...');
      try {
        const pageRes = await axios.get(`https://graph.facebook.com/v25.0/me?fields=name,instagram_business_account&access_token=${token}`);
        if (pageRes.data && pageRes.data.instagram_business_account) {
          console.log(`\n📄 Aapke token se ye Facebook Page juda hai: - ${pageRes.data.name} (ID: ${pageRes.data.id})`);
          foundId = pageRes.data.instagram_business_account.id;
          console.log(`✅ Found Instagram Business Account ID: ${foundId}`);
          return;
        }
      } catch (e) {
        // Fall through
      }

      console.log('⚠️ Trying to fetch specifically for Page ID 105670975490819 (Full Stack Developer)...');
      try {
        const specificRes = await axios.get(`https://graph.facebook.com/v25.0/105670975490819?fields=name,instagram_business_account&access_token=${token}`);
        if (specificRes.data && specificRes.data.instagram_business_account) {
          console.log(`\n📄 Force fetched Facebook Page: - ${specificRes.data.name} (ID: ${specificRes.data.id})`);
          const id = specificRes.data.instagram_business_account.id;
          console.log(`✅ Found Instagram Business Account ID: ${id}`);
          console.log(`\n🎉 SUCCESS! Aapka IG_USER_ID hai: ${id}`);
          console.log(`Isko apni .env file mein IG_USER_ID ke aage paste kar dijiye!`);
          return;
        } else if (specificRes.data) {
          console.log(`\n📄 Page found but no Instagram account linked: ${specificRes.data.name}`);
          return;
        }
      } catch (e) {
        console.log(`❌ Force fetch failed: ${e.response?.data?.error?.message || e.message}`);
      }

      console.log('❌ No Facebook Pages found for this token.');
      return;
    }

    console.log('\n📄 Aapke token se ye Facebook Pages jude hue hain:');
    pages.forEach(page => {
      console.log(` - ${page.name} (ID: ${page.id})`);
    });
    console.log('');

    let foundId = null;
    for (const page of pages) {
      if (page.instagram_business_account && page.instagram_business_account.id) {
        foundId = page.instagram_business_account.id;
        console.log(`✅ Found Instagram Business Account ID: ${foundId}`);
        break;
      }
    }

    if (!foundId) {
      console.log('❌ Facebook Pages were found, but none of them have a linked Instagram Professional/Creator account.');
      console.log('Please ensure you have linked your Instagram account to a Facebook Page.');
    }
  } catch (err) {
    console.error('❌ Error fetching IG_USER_ID:');
    if (err.response && err.response.data) {
      console.error(JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
  }
}

fetchIgUserId();
