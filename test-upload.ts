import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

async function test() {
  const form = new FormData();
  form.append('file', fs.createReadStream('./generated/posts/dsa-day-1-slide-1.png'));
  try {
    const res = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
      headers: form.getHeaders()
    });
    console.log(res.data);
    const url = res.data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
    console.log('Direct URL:', url);
  } catch (err: any) {
    console.error(err.message);
  }
}

test();
