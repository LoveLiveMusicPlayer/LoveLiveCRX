import React, { useState } from 'react';

function PicCompress() {
  const [files, setFiles] = useState([]);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
  };

  const generateRandomName = () => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomName = '';
    for (let i = 0; i < 32; i++) {
      randomName += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomName;
  };

  const processFiles = () => {
    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          const maxWidth = 300;
          const maxHeight = 300;

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            const randomName = generateRandomName();
            const compressedFile = new File([blob], randomName, { type: 'image/jpeg' });

            // 下载处理后的图片
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(compressedFile);
            downloadLink.download = compressedFile.name;
            downloadLink.click();
          }, 'image/jpeg', 0.8);
        };
      };

      reader.readAsDataURL(file);
    });
  };

  return (
    <div
      style={{
        width: '300px',
        height: '300px',
        border: '2px dashed #ccc',
        textAlign: 'center',
        lineHeight: '300px',
        fontSize: '18px',
      }}
      onDragEnter={(e) => e.preventDefault()}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {files.length === 0 ? (
        '将图片拖拽到此处'
      ) : (
        <>
          <button onClick={processFiles}>处理图片</button>
          <ul>
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default PicCompress;
