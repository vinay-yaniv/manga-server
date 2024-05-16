import axios from "axios";
import cheerio from "cheerio";

const scraper = async (url, elemClass) => {
  let data = [];
  let currentIndex = 0;

  let imgType = ["jpg", "jpeg", "chapter"];

  while (true) {
    const searchClass = imgType[currentIndex];
    let searchRegex = `img[${elemClass}$=${searchClass}]`;
    if (currentIndex > 2) {
      searchRegex = `img`;
    }

    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      const images = $(searchRegex);

      images.each(async (index, element) => {
        const imageUrl = $(element).attr(elemClass);
        const regex = /\.png$/;
        if (imageUrl) {
          if (!regex.test(imageUrl)) {
            let cleanedLink = imageUrl.replace(/\t/g, "").replace(/\n/g, "");
            data.push(cleanedLink);
          }
        }
      });

      if (data.length > 4) {
        console.log(`elemments with class ${searchRegex}`);
      } else {
        console.log(
          `No img elemments with class ${searchRegex} found on the page.`
        );
      }
    } catch (error) {
      console.log("error in Scrapper.js in Scrapper");
      console.log(error);
      return;
    } finally {
      currentIndex = currentIndex + 1;

      if (data.length > 5 || currentIndex > 4) {
        return data;
      }
    }
  }
};

const scrapeTotal = async (url) => {
  const elemClass = "a[href*=chapter]";
  let data = [];

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const totalLink = $(elemClass);
    totalLink.each(async (index, element) => {
      const link = $(element).attr("href");
      data.push(link);
    });

    data = Array.from(new Set(data));

    function extractNumberFromLink(link) {
      const re = /chapter[\W0-9]*[a-z]|chapter.*/gi;
      const newStr = link.match(re)[0];
      const reg = /\d+/g;
      const num = newStr
        .match(reg)
        ?.sort((a, b) => parseInt(b) - parseInt(a))[0];
      if (num >= 0) {
        return num;
      } else {
        return -1;
      }
    }

    data.sort((a, b) => extractNumberFromLink(b) - extractNumberFromLink(a));

    while (true) {
      const re = /chapter.*/gi;
      const newStr = data[data.length - 1].match(re)[0];
      const reg = /\d+/g;
      const num = newStr.match(reg);
      if (!num) {
        console.log(data.splice(-1));
      } else {
        break;
      }
    }

    const regex = /https|http/g;
    const isDomain = data[0].match(regex);
    if (!isDomain) {
      const reg = /https:\/+.[a-z0-9.]*/gi;
      const domain = url.match(reg)[0];
      data[data.length - 1] = `${domain}${data[data.length - 1]}`;
      data[0] = `${domain}${data[0]}`;
    }

    if (data.length > 3) {
      console.log({
        totalChapters: data.length,
        firstChapter: data[data.length - 1],
        lastChapter: data[0],
      });
      return {
        totalChapters: data.length,
        firstChapter: data[data.length - 1],
        lastChapter: data[0],
      };
    } else {
      return "failed to load chapters";
    }
  } catch (error) {
    console.log("error in Scrapper.js in scrapeTotal");
    console.log(error);
    return "error in scrapper.js : scrapeTotal";
  }
};

const scrapeLinks = async (url) => {
  const elemClass = "a[href*=chapter]";
  let data = [];

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const totalLink = $(elemClass);
    totalLink.each(async (index, element) => {
      const link = $(element).attr("href");

      data.push(link);
    });

    data = Array.from(new Set(data));

    function extractNumberFromLink(link) {
      const re = /chapter[\W0-9]*[a-z]|chapter.*/gi;
      const newStr = link.match(re)[0];
      const reg = /\d+/g;
      const num = newStr
        .match(reg)
        ?.sort((a, b) => parseInt(b) - parseInt(a))[0];
      if (num >= 0) {
        return num;
      } else {
        return -1;
      }
    }

    data.sort((a, b) => extractNumberFromLink(b) - extractNumberFromLink(a));

    while (true) {
      const re = /chapter.*/gi;
      const newStr = data[data.length - 1].match(re)[0];
      const reg = /\d+/g;
      const num = newStr.match(reg);
      if (!num) {
        console.log(data.splice(-1));
      } else {
        break;
      }
    }

    const regex = /https|http/g;
    const isDomain = data[0].match(regex);
    if (!isDomain) {
      const reg = /https:\/+.[a-z0-9.]*/gi;
      const domain = url.match(reg)[0];
      data.forEach((elem, index) => {
        data[index] = `${domain}${elem}`;
      });
    }

    if (data.length > 3) {
      return data;
    } else {
      return "failed to load chapters";
    }
  } catch (error) {
    console.log("error in Scrapper.js in ScrapeLinks");
    console.log(error);
    console.log(url);
  }
};

const updateChapter = async (url) => {
  const elemClass = "a[href*=chapter]";
  let data = [];
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const totalLink = $(elemClass);
    totalLink.each(async (index, element) => {
      const link = $(element).attr("href");
      data.push(link);
    });

    data = Array.from(new Set(data));

    function extractNumberFromLink(link) {
      const re = /chapter[\W0-9]*[a-z]|chapter.*/gi;
      const newStr = link.match(re)[0];
      const reg = /\d+/g;
      const num = newStr
        .match(reg)
        ?.sort((a, b) => parseInt(b) - parseInt(a))[0];
      if (num >= 0) {
        return num;
      } else {
        return -1;
      }
    }

    data.sort((a, b) => extractNumberFromLink(b) - extractNumberFromLink(a));

    while (true) {
      const re = /chapter.*/gi;
      const newStr = data[data.length - 1].match(re)[0];
      const reg = /\d+/g;
      const num = newStr.match(reg);
      if (!num) {
        console.log(data.splice(-1));
      } else {
        break;
      }
    }

    const regex = /https|http/g;
    const isDomain = data[0].match(regex);
    if (!isDomain) {
      const reg = /https:\/+.[a-z0-9.]*/gi;
      const domain = url.match(reg)[0];

      data[0] = `${domain}${data[0]}`;
    }

    if (data.length > 1) {
      return [data.length, data[0]];
    } else {
      console.log("no chapter scraped in updatechapter scrapper.js");
    }
  } catch (err) {
    console.log("error in scraper.js : updateChapter");
    console.log(url);
    return -1;
  }
};

export { scraper, scrapeTotal, scrapeLinks, updateChapter };
