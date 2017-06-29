import React, {Component} from 'react';
import Slider from 'react-slick';

class Onboarding extends Component {
  static defaultProps = {
    onStart: () => {}
  }
  render() {
    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
    };
    return (
      <div style={styles.onboarding}>
        <div style={styles.white}></div>
        <div style={styles.screenshot}></div>
        <div style={styles.sliderWrapper}>
          <Slider {...settings}>
            <div>
              <h3>Mind Map</h3>
              <p>Arrange the things that you want to scrape visually using mind map</p>
            </div>
            <div>
              <h3>Node Editor</h3>
              <p>Edit the title and selector of the node easily within the web</p>
            </div>
            <div>
              <h3>Export To JSON</h3>
              <p>Easily browse and export the scraping result to JSON</p>
            </div>
          </Slider>
        </div>
        <a href="#" style={styles.startButton} onClick={() => this.props.onStart()}>🏃 START</a>
      </div>
    );
  }
}

const styles = {
  onboarding: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(75,144,247,.8)',
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    flexDirection: 'column',
  },
  screenshot: {
    background: 'url("/images/screenshot.png") no-repeat',
    width: 400,
    height: 300,
    margin: '20px',
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    zIndex: 1,
  },
  white: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 400,
    backgroundColor: 'rgba(255,255,255,.9)',
    zIndex: 0,
  },
  sliderWrapper: {
    width: 320,
  },
  startButton: {
    backgroundColor: '#4b90f7',
    padding: '20px 60px',
    width: 100,
    height: 25,
    borderRadius: 50,
    textAlign: 'center',
    fontWeight: '900',
    textDecoration: 'none',
    color: '#fff',
    zIndex: 2,
  },
};

export default Onboarding;
