// ImageBB API Key
const imageBBApiKey = '42d270ce0feaa7863db65e5ecceaf03c';

// Create an overlay for upload progress
const overlay = document.createElement('div');
overlay.style.position = 'fixed';
overlay.style.top = '0';
overlay.style.left = '0';
overlay.style.width = '100%';
overlay.style.height = '100%';
overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
overlay.style.color = 'white';
overlay.style.display = 'flex';
overlay.style.alignItems = 'center';
overlay.style.justifyContent = 'center';
overlay.style.fontSize = '20px';
overlay.style.zIndex = '1000';
overlay.style.display = 'none';
document.body.appendChild(overlay);

document.getElementById('image-input-btn').addEventListener('click', () => {
  document.getElementById('image-input').click();
});

document.getElementById('image-input').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Convert the file to Base64 for ImageBB API
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    const base64Image = reader.result.split(',')[1];
    
    // Use XMLHttpRequest for API request
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.imgbb.com/1/upload?key=${imageBBApiKey}`, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    // Show overlay and initialize progress text
    overlay.style.display = 'flex';
    overlay.textContent = 'Uploading Image... 0%';

    // Update overlay text with upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        overlay.textContent = `Uploading Image... ${percentComplete}%`;
      }
    };

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        overlay.style.display = 'none'; // Hide overlay when upload is complete

        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            const imageUrl = response.data.url;

            // Optional: Send the image URL to Firebase
            const message = {
              imageURL: imageUrl, // Store the image URL in the message
              timestamp: new Date().toISOString(),
              userName: userName,
              userColor: userColor
            };

            // Send the message to Firebase (or another chat database)
            database.ref(`chats/${currentRoom}`).push(message);

            // Display the image in the chat only for other users
            if (!isCurrentUser) {
              displayMessage(message);
            }
          } else {
            alert("Image upload failed. Please try again.");
          }
        } else {
          alert("Image upload failed. Please check your network connection.");
        }
      }
    };

    // Send base64 image data in the required format
    xhr.send(`image=${encodeURIComponent(base64Image)}`);
  };
});

// Function to display messages, including images, in the chat
function displayMessage(message) {
  const messageElement = document.createElement('p');

  const nameSpan = document.createElement('span');
  nameSpan.textContent = `${message.userName || ''}: `;
  nameSpan.style.color = message.userColor;
  nameSpan.style.fontWeight = 'bold';
  messageElement.appendChild(nameSpan);

  // Check if the message contains an image URL
  if (message.imageURL) {
    const imageElement = document.createElement('img');
    imageElement.src = message.imageURL; // Set image source to the URL from ImageBB
    imageElement.style.maxWidth = '100px'; // Adjust image size if necessary
    messageElement.appendChild(imageElement);
  } else {
    messageElement.appendChild(document.createTextNode(message.text));
  }

  chatBox.appendChild(messageElement); // Add the message to the chat box
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom of the chat
}
