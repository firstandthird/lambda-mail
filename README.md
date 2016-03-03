# lambda-mail

  lambda service for composing and sending emails

## api params:
  - 'to'  
  - 'from'
  - 'subject'
  - 'template'  (the name of the template)
  - 'refreshCache' (optional, set this to the literal word 'refresh' to reset the template cache)

##  Email Templates are directories in a named directory under the `emails/` folder on S3 and contain: 
  - 'details.yaml' 
    - stores configuration information about this email
  - 'email.html'
    - handlebars template
    - can make use of partials 
  - partials are defined for all emails in `global/` on s3
  - `global/images/` hosts images for use by templates  
  

## '/lib/conf/' :   (yaml/json files here will be auto-loaded with confi)
  - default.yaml
    - set dev option to true/false (i need to move this into a dev.yaml)
    - bucketName (specify s3 bucket, this is the root directory for `global/` and `emails/`)
    - imageHost (for use in src attribute in img tags in templates, eg: `<img src="{{imageHost}}/images/myImage.jpg">`)
    - partials (this is a list of partials in the form:
      - name (the partial will be registered with this name)
      - filename (an .html file containing  a mustache partial)
  - default-email.yaml
    - mandril host,port, login and password   
 
## lib/
  - 'email.js' : 
    - sends emails via nodemailer and mandrill
  - 'rendering.js' :
    - encapsulates handlebars 
    - persists registered partials in between invocations
  - 's3.js' : 
    - simple wrapper for s3
    - can be reused/expanded upon for other s3 projects
  - 'templateRepository.js' : 
    - storage unit for templates
    - loads partials from s3 and pre-registers them with handlebars for future use
    - loads templates from s3, precompiles them, and stores them for future use    
     
