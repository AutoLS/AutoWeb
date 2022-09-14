var protocol = window.location.protocol;
var hostname = window.location.hostname;
var port = window.location.port;

const tweet_input = document.querySelector('#tweet-input');
const tweet_button = document.querySelector('#tweet-button');

tweet_button.addEventListener('click', post_tweet);

function append_tweet(tweet)
{
    const tweets_div = document.querySelector('#tweet-list');
    const tweet_to_display = document.createElement('div');
    tweet_to_display.innerHTML = tweet;
    tweet_to_display.classList.add('border');
    tweet_to_display.classList.add('border-black');
    tweet_to_display.classList.add('p-5');
    tweet_to_display.classList.add('mt-5');

    tweets_div.appendChild(tweet_to_display);
}

async function post_tweet()
{
    if (tweet_input.value != "")
    {
        let tweet = {
            body: tweet_input.value 
        };

        const result = await fetch('/api/tweet', {
            method: 'POST',
            //mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(tweet),
        });

        if(result.ok)
        {
            let tweet_body = await result.text();
            
            append_tweet(tweet_body);

            console.log(tweet_body);
        }

        tweet_input.value = "";
    }
}

window.onload = async (event) => {
    const result = await fetch('/api/get_tweets');

    if(result.ok)
    {
        let tweets = await result.json();
        if(tweets.data.length > 0)
        {
            tweets.data.forEach(tweet => {
                append_tweet(tweet);
            });
        }
    }
};