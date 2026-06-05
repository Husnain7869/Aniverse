import axios from "axios";
const ANILIST = "https://graphql.anilist.co";
const gql = (query, variables={}) =>
  axios.post(ANILIST, { query, variables }, { headers: { "Content-Type":"application/json","Accept":"application/json" } });

export const getTrending = async (page=1) => {
  const { data } = await gql(`
    query($page:Int){Page(page:$page,perPage:20){media(sort:TRENDING_DESC,type:ANIME){
      id title{romaji english}coverImage{large extraLarge}averageScore episodes duration status genres popularity
      nextAiringEpisode{airingAt episode}startDate{year}
    }}}`, { page });
  return data.data.Page.media;
};

export const getSeasonal = async (season="SPRING", year=2024, page=1) => {
  const { data } = await gql(`
    query($season:MediaSeason,$year:Int,$page:Int){Page(page:$page,perPage:20){media(season:$season,seasonYear:$year,type:ANIME,sort:POPULARITY_DESC){
      id title{romaji english}coverImage{large extraLarge}averageScore episodes duration status genres popularity
    }}}`, { season, year, page });
  return data.data.Page.media;
};

export const searchAnime = async (search, page=1, genre=null, status=null, year=null) => {
  const { data } = await gql(`
    query($search:String,$page:Int,$genre:String,$status:MediaStatus,$year:Int){Page(page:$page,perPage:20){media(
      search:$search,type:ANIME,sort:SEARCH_MATCH,genre:$genre,status:$status,seasonYear:$year
    ){id title{romaji english}coverImage{large extraLarge}averageScore episodes duration status genres popularity}}}`,
    { search, page, genre, status:status||undefined, year:year||undefined });
  return data.data.Page.media;
};

export const getAnimeDetails = async (id) => {
  const { data } = await gql(`
    query($id:Int){Media(id:$id,type:ANIME){
      id title{romaji english native}coverImage{extraLarge}bannerImage
      description(asHtml:false)averageScore popularity episodes duration status genres
      startDate{year month day}endDate{year month day}
      studios{nodes{name isAnimationStudio}}
      characters(sort:ROLE,perPage:12){nodes{name{full}image{medium}}}
      staff(sort:RELEVANCE,perPage:8){nodes{name{full}image{medium}primaryOccupations}}
      recommendations(sort:RATING_DESC,perPage:8){nodes{mediaRecommendation{id title{romaji}coverImage{large}averageScore genres duration episodes}}}
      relations{nodes{id title{romaji}coverImage{large}type format}}
      trailer{id site}
      nextAiringEpisode{airingAt episode}
    }}`, { id });
  return data.data.Media;
};
