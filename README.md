# Opener API
### Opener API for generating hex code for using with Opener and accessing nhentai open graph data
This API is hosted on [now.sh][now.sh], you might need to config your node.env yourself.

## Usage
Example of fetching API

```
// With Fetch
fetch("https://opener.now.sh/api/generate/229345").then(res => { res.json(); ).then(data => {
    // Here fetched data
});
```

```
// With Axios
Axios("https://opener.now.sh/api/generate/229345").then(data => {
    // Here fetched data
});
```

## Endpoint
Here is a list of available endpoint for API.
- /api/g/:id | Get open graph data of specific ID

- /api/generate/:id | Get generated hex code return data:image on success

- /api/relate/:id | Get related story of provided id