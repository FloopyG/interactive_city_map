// src/ImageSlider.js
import React from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const ImageSlider = ({ images }) => {
  if (!images || images.length === 0) {
    return null;
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  return (
    <Slider {...settings}>
      {images.map((image, index) => (
        <div key={index}>
          <img 
            src={image.image_url} 
            alt={image.caption || `slide-${index}`} 
            style={{ width: "100%", height: "auto" }} 
          />
        </div>
      ))}
    </Slider>
  );
};

export default ImageSlider;
