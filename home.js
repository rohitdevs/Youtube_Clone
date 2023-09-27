const apiKey="AIzaSyBpt29jCyXSKVeeB2GRg3tdcKamzLB47Ms";
//AIzaSyDvo2p4xMEI3GC-PWH02_0OAIN1h88k4rE
//AIzaSyAwoLey4IDTAJYFhXW9XouU0dvsNVYHPDM
//AIzaSyBpt29jCyXSKVeeB2GRg3tdcKamzLB47Ms
const baseUrl="https://www.googleapis.com/youtube/v3";



const searchButton=document.getElementById("search-button");
const searchInput=document.getElementById("search-input");
const container=document.getElementById("container1");




function formatYouTubeViews(number) {
    if (number < 1000) {
        return number.toString(); // Leave the number as is if it's less than 1,000
    } else if (number < 1000000) {
        // Format as "X.XK" for thousands (e.g., 1.5K)
        return (number / 1000).toFixed(1) + "K";
    } else {
        // Format as "X.XM" for millions (e.g., 2.5M)
        return (number / 1000000).toFixed(1) + "M";
    }
}

function navigateToVideoDetails(videoId) {
  document.cookie = `id=${videoId}; path=/play-video.html`;
  window.location.href = "/video-details.html";
}

function calculateTheTimeGap(publishTime)
{
  let publishDate=new Date(publishTime);
  let currentDate=new Date();

  let secondsGap=(currentDate.getTime()-publishDate.getTime())/1000;
  const secondsPerDay= 24*60*60;
const secondsPerWeek= 7 * secondsPerDay;
const secondsPerMonth= 30 * secondsPerDay;
const secondsPerYear= 365 * secondsPerDay;
if(secondsGap<secondsPerDay)
{
  return `${Math.ceil(secondsGap/(60*60))} hrs ago`;
}
if(secondsGap<secondsPerWeek)
{
  return `${Math.ceil(secondsGap / secondsPerWeek)} weeks ago`;
}
if(secondsGap<secondsPerMonth)
{
  return `${Math.ceil(secondsGap / secondsPerMonth)} months ago`;
}
  return `${Math.ceil(secondsGap / secondsPerYear)} years ago`;

}

//this will take video id and return statistics
async function  getVideoStatistics(videoId)
{
    const endpoint=`${baseUrl}/videos?key=${apiKey}&part=statistics&id=${videoId}`
    try{
      const response=await fetch(endpoint);
      const result=await response.json();
      return result.items[0].statistics;
    }
    catch(error)
    {
      console.log(error);
    }
}



function renderVideosOntoUI(videosList)
{
  container.innerHTML='';
videosList.forEach((video) => {
  const videoContainer=document.createElement("div");
  videoContainer.className="video-content-cover";
  videoContainer.innerHTML=`
  <div class="video-content">
  <a href="#" class="video-box">
      <img src="${video.snippet.thumbnails.high.url}" alt="">
  </a>
  <div class="video-details">
      <div class="channel-logo">
          <img src="${video.channelLogo}" alt="">
      </div>
      <div class="detail">
          <h3 class="title">${video.snippet.title}</h3>
          <div class="channel-name">${video.snippet.channelTitle}</div>
          <div class="views-upload">
              <div class="views">${formatYouTubeViews(video.statistics.viewCount)}. </div>
              <div class="upload">${calculateTheTimeGap(video.snippet.publishTime)}</div>
          </div>

      </div>
  </div>
  <div class="hidden-content">
      <div class="btn"><i class="ri-time-line"></i>Watch later</div>
      <div class="btn"><i class="ri-play-list-2-line"></i>Add to queue</div>
  </div>
</div>
 `;
 videoContainer.addEventListener("click", () => {
  navigateToVideoDetails(video.id.videoId);
});
 container.appendChild(videoContainer);
});
}


async function fetchChannelLogo(channelId)
{
  const endpoint=`${baseUrl}/channels?key=${apiKey}&id=${channelId}&part=snippet`;
  try{
    const response=await fetch(endpoint);
    const result=await response.json();
    return result.items[0].snippet.thumbnails.high.url;
  }
  catch(error){
    console.log("failed to load channel logo");
  }
}

async function fetchSearchResults(searchString)
{
  const endpoint=`${baseUrl}/search?key=${apiKey}&q=${searchString}&part=snippet&maxResults=10`;
  try{
      const response=await fetch(endpoint);
      const result=await response.json();

     for(let i=0;i<result.items.length;i++)
     {
      let currentVideoId=result.items[i].id.videoId;
      let channelId=result.items[i].snippet.channelId;
      const currentVideoStatistics=await getVideoStatistics(currentVideoId);
      let channelLogo=await fetchChannelLogo(channelId);
      result.items[i].statistics=currentVideoStatistics;
      result.items[i].channelLogo=channelLogo;
     }

     renderVideosOntoUI(result.items);
    
  }
  catch(error)
  {
    console.log(error)
  }
}

searchButton.addEventListener("click",()=>{
  const searchValue=searchInput.value;
  fetchSearchResults(searchValue);

})

fetchSearchResults("");