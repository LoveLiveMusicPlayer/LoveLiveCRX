import React, {useEffect, useState} from 'react';
import './Popup.css';
import {Image} from "antd";
import axios from "axios";

const Popup = () => {

  const category = ["lovelive", "azurlane", "bluearchive", "genshinimpact", "arknights", "honkai", "frontline", "princess", "idolmaster", "hololive"]

  const [image, setImage] = useState('')

  useEffect(() => {
    fetchPhoto()
  }, [])

  const parseArrayBuffer = (arraybuffer) => {
    const base64 = btoa(
        new Uint8Array(arraybuffer).reduce((data, byte) =>
            data + String.fromCharCode(byte), '')
    )
    setImage("data:image/png;base64," + base64)
  }

  const parseXML = (html) => {
    const parser = new DOMParser()
    const xml = parser.parseFromString("<div>" + html + "</div>", "text/xml")
    const elements = xml.getElementsByTagName("img")
    const reg = new RegExp(`(?<=src=")(.*?)(?=")`)
    const res = "https://" + reg.exec(elements[0].outerHTML)[0]
    setImage(res)
  }

  const fetchPhoto = () => {
    const number = Math.floor(Math.random() * category.length)
    console.log(number)
    axios({
      method: 'get',
      // url: 'https://img.xjh.me/random_img.php',
      url: 'https://image.anosu.top/pixiv/direct?r18=1&size=small&keyword=' + category[0],
      responseType: 'arraybuffer'
    })
        .then(function (response) {
          parseArrayBuffer(response.data)
          // parseXML(response.data)
        })
  }

  const renderPicture = () => {
    if (image === "") {
      return <Image
          height={'280px'}
          src={'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMiIgZGF0YS1uYW1lPSJMYXllciAyIg0KICAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCI+DQogICAgPHBhdGgNCiAgICAgICAgZD0iTTgyNC40LDYwMS4yNWMtMTgsMjAtNTkuNSwxMjcuNS01MiwxODMsNC41LDguNSw1OCwxMiw3Ni00czQ5LTExMCw0Ni0xMzQtNDEtNDUtNDktNjMtMi0zNy0yLTkwdi0yYzAtMTU3LjQtMTI3LjYtMjg1LTI4NS0yODVzLTI4NSwxMjcuNi0yODUsMjg1djJjMCw1Myw2LDcyLTIsOTBzLTQ2LDM5LTQ5LDYzLDI4LDExOCw0NiwxMzQsNzYsNCw3Niw0Ig0KICAgICAgICBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojZmYwMDczO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MTBweCIgLz4NCiAgICA8cGF0aCBkPSJNNzQ4LjA3LDc2Ny4yOUEyODUuNDcsMjg1LjQ3LDAsMCwxLDQ2OC43OSw4MjUuMiINCiAgICAgICAgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6I2Y0YzQyZDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjEwcHgiIC8+DQogICAgPHBhdGgNCiAgICAgICAgZD0iTTI5Ny40LDYyNi4yNWMxOSw3MSw1NSwxODAsMTU1LjUsMjE0LjUtMzguNS00My41LTcyLjUtMTA2LjUtNzkuNS0xNjMuNSwxOSw0Myw0Niw2Myw4Miw3Ni03Mi0xMDItODEtMjY3LTExLTM4My05LDEwMCwyMCwyMTgsNzIuNSwyNzUuNS0xOS02OS0xOC41LTEyNS41LTQuNS0xNzQuNSw2LDc3LDI4LDE1MCw3NywxODYtMjItNTItMjctMTI3LTE4LjUtMTUzLjUsOC41LDUxLjUsNDQuNSw5OC41LDgwLjUsMTA5LjUtMjgtNTgtMzctMjI4LTE3LjUtMjQ3LjUsNTIsMCwxMjguNSw0My41LDE0OC41LDcyLjUsMTAsMTE2LTIwLDE5OS0xMjIsMjk1LDM5LDAsNzAtMTEsOTItMzEiDQogICAgICAgIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiNmNzkzMWU7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS13aWR0aDoxMHB4IiAvPg0KICAgIDxwb2x5bGluZQ0KICAgICAgICBwb2ludHM9IjI3MS40IDQwMS4yNSAyNDIuNCAzNzkuMjUgMjg5LjQgMzUwLjI1IDI0Mi40IDI5Ny4yNSAzMzYuNCAyNzEuMjUgMzc0LjQgMTU5LjI1IDQyOC40IDIxNy4yNSINCiAgICAgICAgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6I2Y0YzQyZDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjEwcHgiIC8+DQogICAgPHBhdGgNCiAgICAgICAgZD0iTTMzMi40LDIwMy4yNWMtMzMtMjgtODMtMTgtMTEwLDMycy0xMSwxNTYtMTgsMjE3LTQ3LDEwOS03NSwxMzVjMjQtNCw1MC0xOCw2Ni0zOC0yMSw2Ny0yNCwxNzYsMjgsMjM2Ig0KICAgICAgICBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojZjc5MzFlO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MTBweCIgLz4NCjwvc3ZnPg=='}
          preview={false}
      />
    } else {
      return <Image
          height={'auto'}
          src={`${image}`}
          preview={false}
          onDoubleClick={() => {
            setImage("")
            fetchPhoto()
          }}
      />
    }
  }

  return (
      <div className="App">
        <header className="App-header">
          {renderPicture()}
        </header>
      </div>
  );
};

export default Popup;
