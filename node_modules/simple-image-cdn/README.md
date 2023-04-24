# Simple Image CDN

Simple and free image CDN


## Install

``` yarn add simple-image-cdn ```


``` npm i simple-image-cdn ```

## Usage

```
import getImageUrl from 'simple-image-cdn';
```

## Example

```
const url = 'https://cdn.pixabay.com/photo/2016/03/27/18/54/technology-1283624_960_720.jpg';
const src = getImageUrl(url, {w: '100', h: '100', fit: 'cover' });

console.log(src)

//expect url:
//https://images.weserv.nl/?url=https%3A%2F%2Fcdn.pixabay.com%2Fphoto%2F2016%2F03%2F27%2F18%2F54%2Ftechnology-1283624_960_720.jpg&w=100&h=100&fit=cover


```

### Options

<table>
<tr>
    <td>Name</td>
    <td>param</td>
    <td>options</td>
    <td>description</td>
    <td>example</td>
</tr>

<tr>
    <td>Width</td>
    <td>w</td>
    <td>Number (pixels)</td>
    <td>Sets the width of the image, in pixels.</td>
    <td>{w : 1080}</td>
</tr>

<tr>
    <td>Height</td>
    <td>h</td>
    <td>Number (pixels)</td>
    <td>Sets the height of the image, in pixels.</td>
    <td>{h: 1080}</td>
</tr>

<tr>
    <td>Fit</td>
    <td>fit</td>
    <td>cover, fill, contain, inside, outside, we</td>
    <td>Set height of the image</td>
    <td>{fit: 'cover'}</td>
</tr>

<tr>
    <td>Device pixel ratio</td>
    <td>dpr</td>
    <td>Values between 1 and 8</td>
    <td>The device pixel ratio is used to easily convert between CSS pixels and device pixels.</td>
    <td>{dpr: 2}</td>
</tr>

<tr>
    <td>Smart crop</td>
    <td>a</td>
    <td> 
     >**entropy:** focus on the region with the highest.
     >**attention:** focus on the region with the highest luminance frequency, color saturation and presence of skin tones.
    </td>
    <td>An experimental strategy-based approach to crop the image by removing boring parts. This only works with {fit : cover}</td>
    <td>{fit : cover, a : attention}</td>
</tr>

<tr>
    <td>Blur</td>
    <td>blur</td>
    <td>Use values between 0 and 100.</td>
    <td>Adds a blur effect to the image.</td>
    <td>{blur: 5}</td>
</tr>

<tr>
    <td>Contrast</td>
    <td>con</td>
    <td>Use values between -100 and +100, where 0 represents no change.</td>
    <td>Adjusts the image contrast.</td>
    <td>{blur: 5}</td>
</tr>

<tr>
    <td>Gamma</td>
    <td>gam</td>
    <td>Use values between 1 and 3. The default value is 2.2.</td>
    <td>Adjusts the image gamma.</td>
    <td>{gam: 3}</td>
</tr>

<tr>
    <td>Brightness</td>
    <td>mod</td>
    <td>
     > '>1' will increase brightness
     > '< 1' will decrease the brightness.
     </td>
    <td>Adjusts the brightness of the image. </td>
    <td>{mod: 2}</td>
</tr>

<tr>
    <td>Output</td>
    <td>output</td>
    <td>Accepts jpg, png, gif, tiff, webp or json.</td>
    <td>Encodes the image to a specific format.</td>
    <td>{output: 'jpg'}</td>
</tr>

<tr>
    <td>Quality</td>
    <td>q</td>
    <td>Values between 0 and 100. Defaults to 85.</td>
    <td>Defines the quality of the image. his only works when the output image is jpg, tiff or webp.</td>
    <td>{q: 90}</td>
</tr>

<tr>
    <td>Compression level </td>
    <td>l</td>
    <td>Use a value between 0 and 9.</td>
    <td>The default value is 6. This only works when the output image is png</td>
    <td>{l: 4}</td>
</tr>

<tr>
    <td>Filename</td>
    <td>filename</td>
    <td>String</td>
    <td>The filename must only contain alphanumeric characters.</td>
    <td>{filename: "foto"}</td>
</tr>
</table>

**You can get the full documentation here:** [https://images.weserv.nl/docs/](https://images.weserv.nl/docs/)

### Limitation

You can only process 700 images per hour.


### Special Thanks

We use **Images.weserv.nl**, a cool and free service.
Checkout here: [https://images.weserv.nl/](https://images.weserv.nl/)

