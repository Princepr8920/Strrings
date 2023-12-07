const {
  CloudFrontClient,
  CreateInvalidationCommand,
} = require("@aws-sdk/client-cloudfront");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECURITY_KEY,
  },
  region: process.env.AWS_REGION,
});

const cloudFront = new CloudFrontClient({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECURITY_KEY,
  },
});

async function upload(files, dir = "") {
  try {
    // files parameter is type of object
    let response = [];

    let setDir = dir !== "" ? `${dir}/` : "";
    /**
      @setDir set folder for aws bucket to save files 
     if we want to save file in nested folder we need 
     to specify the folder name with dir parameter otherwise it save the file in outer folder*/
    for (let file in files) {
      const uploadData = {
        Bucket: process.env.AWS_BUCKET,
        Body: files[file].buffer,
        Key: `${setDir}${file}/${files[file].originalname}`, // path of aws s3 bucket
        ContentType: files[file].mimetype,
      };

      let command = new PutObjectCommand(uploadData);
      response.push(s3.send(command)); // Push promises into the array
    }

    let result = Promise.all(response) // Use Promise.all() to wait for all uploads to complete
      .then((data) => {
        return {
          data,
          success: true,
          message: "File uploaded successfully",
        };
      })
      .catch((err) => {
        console.error(err);
        return {
          error: err,
          success: false,
          message: "File not uploaded",
        };
      });

    return result;
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
}

const removeCloudfrontUrl = (e) => e.replace(/(\w*\:+\/+\/+[\w.]*net+\/+)/, ""); // To remove the cloudFront url from item path

async function deleteFile(itemsToDelete, invalidate = false) {
  try {
    const response = [];
    const itemsToInvalidate = [];
    const bucket = process.env.AWS_BUCKET;

    for (let i of itemsToDelete) {
      if (!i.includes("default")) {
        // prevent to delete default items from aws bucket
        let item = removeCloudfrontUrl(i);

        let command = new DeleteObjectCommand({ Bucket: bucket, Key: item });
        response.push(s3.send(command));
        itemsToInvalidate.push("/" + item);

        /*We are pushing items for invalidation to array 
          with slash*/

        if (item.includes("large")) {
          let small = item.replace(/large/g, "small");
          /* if item includes "small or large" keyword it means there are another
          copy of it that are in "large or small" size so we delete and invalidate the both*/
          response.push(
            s3.send(
              new DeleteObjectCommand({
                Bucket: bucket,
                Key: small,
              })
            )
          );
          itemsToInvalidate.push("/" + small);
        } else if (item.includes("small")) {
          let large = item.replace(/small/g, "large");
          response.push(
            s3.send(
              new DeleteObjectCommand({
                Bucket: bucket,
                Key: large,
              })
            )
          );
          itemsToInvalidate.push("/" + large);
        }
      }
    }

    if (response.length) {
      let result = Promise.all(response)
        .then(async (data) => {
          if (invalidate) {
            // Invalidate (clear) the item cache from Cloudfront
            await invalidateFile(itemsToInvalidate, true);
          }

          return {
            data,
            success: true,
            message: "File deleted successfully",
          };
        })
        .catch((err) => ({
          error: err,
          success: false,
          message: "File not deleted",
        }));

      return result;
    }
    return { success: true, message: "File deleted successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
}

//Invalidate(clear) the item cache from Cloudfront
async function invalidateFile(itemsToInvalidate, isDeleted = false) {
  try {
    const removeCloudfrontUrl = (e) =>
      e.replace(/(\w*\:+\/+\/+[\w.]*net+\/+)/, "");
    let allItems = itemsToInvalidate;

    if (!isDeleted) {
      allItems = [];
      for (let item of itemsToInvalidate) {
        if (!item.includes("default")) {
          let pathWithItem = removeCloudfrontUrl(item);

          if (pathWithItem.includes("large")) {
            let small = pathWithItem.replace(/large/g, "small");
            /* if pathWithItem includes "small or large" keyword it means there are another
          copy of it exist in Aws bucket in "large or small" size so we invalidate the both*/
            allItems.push("/" + small);
          } else if (pathWithItem.includes("small")) {
            let large = pathWithItem.replace(/small/g, "large");
            allItems.push("/" + large);
          }
          allItems.push("/" + pathWithItem);
        }
      }
    }

    const InvalidateParams = {
      DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: Date.now().toString(),
        Paths: {
          Quantity: allItems.length,
          Items: allItems,
        },
      },
    };
    const InvalidateCommand = new CreateInvalidationCommand(InvalidateParams);
    let result = await cloudFront.send(InvalidateCommand);
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
}

module.exports = { upload, deleteFile, invalidateFile };
