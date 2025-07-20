const apiKey = 'YOUR_GOOGLE_API_KEY';
const cx = 'YOUR_SEARCH_ENGINE_ID';
const query = 'OpenAI';

const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${query}`;

const res = await fetch(url);
const data = await res.json();
console.log(data);
