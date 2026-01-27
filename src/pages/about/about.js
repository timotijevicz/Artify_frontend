import React from 'react';
import './about.css';

function ONama() {
  return (
    <>
      <div className='about-page'>
        <div className="about-container">

          {/* Naslovna sekcija */}
          <div className="about-header">
            <h1>About Artify</h1>
            <p>Your gateway to the world of art and creativity!</p>
          </div>

          {/* Glavni sadržaj */}
          <div className="about-content">

            {/* Sekcija: Misija i vizija */}
            <section className="mission-vision">
              <h2>Our mission & vision</h2>
              <p>
                At <strong>Artify</strong>, our mission is to connect artists and art lovers worldwide, 
                creating a vibrant platform where creativity thrives and art finds its way to the right audience.  
                We want to empower artists to showcase, promote, and sell their artworks easily while giving collectors and enthusiasts 
                a trusted place to discover unique pieces.
              </p>
              <p>
                Our vision is to make art accessible to everyone — whether you are an experienced collector or simply someone who wants 
                to enjoy beauty and creativity in your daily life. With Artify, art is just a click away.
              </p>
            </section>

            {/* Sekcija: Galerija slika umetničkih dela */}
            <section className="image-gallery">
              <div className="images">
                <div className="image-item"><img src="/images/art1.jpg" alt="Artwork 1" /></div>
                <div className="image-item"><img src="/images/art2.jpg" alt=" Artwork 2" /></div>
                <div className="image-item"><img src="/images/art3.jpg" alt="Artwork 3" /></div>
                <div className="image-item"><img src="/images/art4.jpg" alt="Artwork 4" /></div>
              </div>
            </section>

            {/* Sekcija: Kontakt informacije */}
            <section className="contact-us">
              <div className="contact-text">
                <h2>Contact us</h2>
                <p>
                  Do you have questions, feedback, or need assistance?  
                  Feel free to reach out to us — we’re always here to help!
                </p>
                <p>Email: <strong>artify_support@gmail.com</strong></p>
                <p>Phone: <strong>+381 65 123 4567</strong></p>
                <p>Address: <strong>Kralja Petra 10, Belgrade, Serbia</strong></p>
              </div>
              <div className="organization-image">
                <img src="./images/artify-team.jpg" alt="Artify Team" />
              </div>
            </section>

            {/* Sekcija: Ko smo mi */}
            <section className="who-we-are">
              <h2>Who are we</h2>
              <p>
                <strong>Artify</strong> is a project developed by <em>ArtSpark</em>, 
                a creative team of passionate students, developers, and art enthusiasts.  
                Our goal is to blend technology and art, providing a platform where creativity meets innovation.
              </p>
              <p>
                We believe that art has the power to inspire, connect, and transform — 
                and with Artify, we want to bring that power closer to you.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

export default ONama;