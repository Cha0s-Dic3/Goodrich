import type { SupportedLanguage } from '../context/AppContext';

type TranslationValue = string | string[];
type TranslationNode = {
  [key: string]: TranslationNode | TranslationValue;
};

export type TranslationTree = Record<SupportedLanguage, TranslationNode>;

export const translations: TranslationTree = {
  en: {
    header: {
      brand: 'Goodrich',
      tagline: 'Fresh Farm Eggs',
      nav: {
        home: 'Home',
        about: 'About Us',
        practices: 'Farm Practices',
        shop: 'Shop',
        gallery: 'Gallery',
        contact: 'Contact'
      },
      language: {
        label: 'Select language',
        rw: 'Kinyarwanda',
        en: 'English',
        sw: 'Kiswahili',
        fr: 'French'
      },
      account: {
        myAccount: 'My Account',
        signIn: 'Sign In'
      },
      role: {
        admin: 'Admin',
        adminMode: 'Admin Mode',
        user: 'User'
      },
      logout: 'Logout',
      cartTitle: 'Items: {{items}} * Trays: {{trays}}',
      logoAlt: 'Goodrich Farm Logo'
    },
    splash: {
      farmName: 'HABAKURAMA Jean de Dieu',
      title: 'Fresh Eggs, Trusted Farming',
      subtitle: 'Preparing quality farm products and delivery services...'
    },
    farmPractices: {
      heroTitle: 'Our Farm Practices',
      heroDescription:
        "Responsible farming is not a trend - it is our standard. Every practice we follow is designed to protect animal welfare, ensure food safety, and support environmental sustainability.",
      animalWelfareTitle: 'Animal Welfare',
      animalWelfareIntro: 'We believe healthy chickens grow best in comfortable and natural environments.',
      freeRangeTitle: 'Free-Range Practices',
      freeRangeDescription:
        'Our chickens are raised using free-range methods, allowing them to move freely, express natural behaviors, and live with reduced stress.',
      coopTitle: 'Coop Conditions and Space',
      coopList: [
        'Clean, well-maintained housing',
        'Adequate space per bird to prevent overcrowding',
        'Regular sanitation and biosecurity measures'
      ],
      ventilationTitle: 'Natural Light and Ventilation',
      ventilationLead: 'Our poultry houses are designed to:',
      ventilationList: [
        'Maximize natural daylight',
        'Ensure continuous fresh air circulation',
        'Maintain safe temperature and humidity levels'
      ],
      nutritionTitle: 'Feed and Nutrition',
      nutritionIntro: 'Nutrition plays a key role in animal health and product quality.',
      nonGmoTitle: 'Non-GMO Feed',
      nonGmoDescription:
        'We use carefully selected non-GMO feed ingredients to promote natural growth and overall bird health.',
      noAntibioticsTitle: 'No Antibiotics or Hormones',
      noAntibioticsList: [
        'No growth hormones',
        'No routine antibiotic use',
        'Medication is only used when absolutely necessary and under veterinary guidance'
      ],
      supplementsTitle: 'Natural Supplements',
      supplementsLead: 'Our feeding program includes:',
      supplementsList: [
        'Vitamins and minerals',
        'Natural immune-boosting supplements',
        'Balanced protein sources for healthy development'
      ],
      sustainabilityTitle: 'Sustainability',
      sustainabilityIntro:
        'We are committed to farming in a way that protects the environment for future generations.',
      wasteTitle: 'Waste Management',
      wasteList: [
        'Proper handling and recycling of poultry waste',
        'Use of organic waste for compost and soil enrichment',
        'Clean disposal systems to prevent environmental contamination'
      ],
      waterTitle: 'Water Conservation',
      waterList: [
        'Controlled water usage systems',
        'Regular monitoring to prevent waste',
        'Clean and safe water supply for all birds'
      ],
      ctaTitle: 'Experience the Difference',
      ctaDescription:
        'Our commitment to responsible farming means healthier chickens and better eggs for you and your family.',
      stats: {
        chickens: 'Chickens Capacity',
        freeRange: 'Free-Range',
        antibiotics: 'Antibiotics Used'
      }
    },
    footer: {
      brand: 'Goodrich Farm',
      about: 'Quality chicken farming with responsible practices. Fresh eggs delivered to your doorstep.',
      quickLinks: 'Quick Links',
      links: {
        about: 'About Us',
        practices: 'Farm Practices',
        shop: 'Shop Products',
        gallery: 'Gallery',
        contact: 'Contact Us',
        announcements: 'Announcements',
        orders: 'My Orders'
      },
      contactTitle: 'Contact Us',
      addressLine1: 'Eastern Province, Kayonza District',
      addressLine2: 'Rukara Sector, Kawangire Cell',
      deliveryTitle: 'Delivery Zones',
      delivery: {
        local: 'Local (10km): 3,000 FRW',
        regional: 'Regional (51-60km): 10,000 FRW',
        national: 'National: Calculated',
        minimumLabel: 'Minimum Order:',
        minimumValue: '4,500 FRW'
      },
      copyright: 'Copyright 2026 Goodrich Chicken Farm. Farmer: HABAKURAMA Jean de Dieu. All rights reserved.'
    },
    home: {
      heroBadge: 'Fresh from our farm to your table',
      heroTitle1: 'Premium Quality',
      heroTitle2: 'Farm Fresh Eggs',
      heroLocationLine: 'Goodrich Poultry Farm Rwanda — Kayonza District',
      heroDescription: 'Raised with care on our 5,000-chicken farm in Eastern Rwanda. Free-range, healthy, and delivered fresh to your doorstep.',
      shopNow: 'Shop Now',
      learnMore: 'Learn More',
      values: {
        naturalTitle: '100% Natural',
        naturalDesc: 'No hormones or antibiotics. Just natural, healthy eggs.',
        freeRangeTitle: 'Free-Range',
        freeRangeDesc: 'Our chickens roam freely in spacious, clean environments.',
        fastTitle: 'Fast Delivery',
        fastDesc: 'Local delivery within 24 hours. Fresh and reliable.',
        qualityTitle: 'Quality Guaranteed',
        qualityDesc: 'Every egg is carefully inspected for quality and freshness.'
      },
      productsTitle: 'Our Premium Eggs',
      productsDesc: 'Fresh eggs available in different sizes. All eggs are collected daily and delivered fresh.',
      stockLabel: 'Stock:',
      viewDetails: 'View Details',
      viewAllProducts: 'View All Products',
      announcementsTitle: 'Latest Announcements',
      announcementsSubtitle: 'News and updates from Goodrich Farm',
      noAnnouncements: 'No announcements at the moment. Check back soon.',
      testimonialsTitle: 'What Our Customers Say',
      testimonials: {
        one: { quote: "The freshest eggs I've ever had! Delivery is always on time and the quality is exceptional.", name: 'Marie Uwase', place: 'Kigali' },
        two: { quote: "I love knowing where my food comes from. Goodrich Farm's transparency and quality are unmatched!", name: 'Jean Paul Nkusi', place: 'Kayonza' },
        three: { quote: 'Best farm eggs in Rwanda! Perfect for my restaurant. Consistent quality every single time.', name: 'Grace Mutoni', place: 'Restaurant Owner' }
      },
      faqTitle: 'Frequently Asked Questions',
      faqSubtitle: 'Quick answers about our farm and delivery.',
      faq1Question: 'Where can I buy fresh eggs in Rwanda?',
      faq1Answer: 'Order directly from Goodrich Poultry Farm in Kayonza or through our shop page.',
      faq2Question: 'Do you deliver eggs?',
      faq2Answer: 'Yes. Delivery is available across Rwanda with fees based on distance and trays ordered.',
      faq3Question: 'What type of chickens do you raise?',
      faq3Answer: 'We raise healthy layers using ethical, sustainable, and modern farming practices.',
      ctaTitle: 'Ready to Order Fresh Eggs?',
      ctaDesc: 'Experience the difference of truly fresh, farm-raised eggs. Order today and taste the quality!',
      startShopping: 'Start Shopping',
      contactUs: 'Contact Us'
    },
    shop: {
      notEnoughStock: 'Not enough stock available',
      addedToCart: 'Added {{quantity}} {{name}} to cart',
      filters: {
        all: 'All Sizes',
        small: 'Small',
        medium: 'Medium',
        large: 'Large',
        extraLarge: 'Extra Large'
      },
      heroTitle: 'Shop Fresh Eggs',
      heroDesc: 'All eggs are collected daily and delivered fresh. Choose your preferred size and quantity.',
      noProducts: 'No products found',
      inCart: 'In Cart',
      lowStock: 'Low Stock',
      eggsPerTray: 'eggs per tray',
      stock: 'Stock',
      trays: 'Trays',
      outOfStock: 'Out of Stock',
      addToCart: 'Add to Cart',
      whyTitle: 'Why Choose Our Eggs?',
      why: {
        freeRangeTitle: 'Free-Range Quality',
        freeRangeDesc: 'Our chickens roam freely, producing eggs with superior taste and nutrition.',
        dailyTitle: 'Daily Collection',
        dailyDesc: 'Eggs are collected every day to ensure maximum freshness when delivered to you.',
        qualityTitle: 'Quality Inspected',
        qualityDesc: 'Every egg is carefully inspected before packaging to ensure top quality.'
      }
    },
    gallery: {
      filters: {
        all: 'All Photos',
        facilities: 'Farm Facilities',
        chickens: 'Our Chickens',
        team: 'Our Team',
        eggs: 'Fresh Eggs'
      },
      heroTitle: 'Farm Gallery',
      heroDesc: 'Take a visual tour of our farm, facilities, and happy chickens. See where your eggs come from!',
      empty: 'No photos in this category yet',
      visitTitle: 'Visit Our Farm',
      visitDesc: 'Want to see our operations in person? We welcome visitors to tour our facilities and learn about our farming practices.',
      visitAddress: 'Eastern Province, Kayonza District, Rukara Sector',
      visitCall: 'Call 0788455886 to schedule a visit'
    },
    cart: {
      notEnoughStock: 'Not enough stock available',
      empty: 'Your Cart is Empty',
      emptyDesc: 'Start shopping to add fresh eggs to your cart!',
      browseProducts: 'Browse Products',
      minimumOrderError: 'Minimum order is {{amount}} FRW',
      title: 'Shopping Cart',
      subtitle: 'Review your items and proceed to checkout',
      itemsTitle: 'Cart Items',
      remove: 'Remove',
      summaryTitle: 'Order Summary',
      subtotal: 'Subtotal',
      deliveryFeeLocal: 'Delivery Fee (Local)',
      total: 'Total',
      addMore: 'Add {{amount}} FRW more to meet minimum order',
      proceed: 'Proceed to Checkout',
      continueShopping: 'Continue Shopping'
    },
    announcements: {
      title: 'Latest Announcements',
      subtitle: 'Stay updated with our latest news and updates from Goodrich Farm',
      emptyTitle: 'No Announcements Yet',
      emptyDesc: 'Check back soon for updates from Goodrich Farm',
      by: 'By',
      date: 'Date',
      time: 'Time',
      lastUpdated: 'Last updated',
      at: 'at',
      backHome: 'Back to Home'
    },
    contact: {
      title: 'Contact Us',
      subtitle: "Have questions? We're here to help. Reach out to us through any of the channels below.",
      getInTouch: 'Get In Touch',
      locationTitle: 'Our Location',
      locationLine1: 'Eastern Province',
      locationLine2: 'Kayonza District',
      locationLine3: 'Rukara Sector, Kawangire Cell',
      phoneTitle: 'Phone',
      callAnytime: 'Call us anytime',
      emailTitle: 'Email',
      reply24h: 'We reply within 24 hours',
      hoursTitle: 'Business Hours',
      hoursWeekday: 'Monday - Friday: 7:00 AM - 6:00 PM',
      hoursSaturday: 'Saturday: 7:00 AM - 4:00 PM',
      hoursSunday: 'Sunday: Closed',
      followUs: 'Follow Us',
      sendMessageTitle: 'Send Us a Message',
      form: {
        nameLabel: 'Your Name',
        namePlaceholder: 'Enter your full name',
        emailLabel: 'Email Address',
        phoneLabel: 'Phone Number',
        phonePlaceholder: 'Enter your phone number',
        messageLabel: 'Message',
        messagePlaceholder: 'How can we help you?',
        sending: 'Sending...',
        send: 'Send Message'
      },
      messageSent: 'Message sent! We will get back to you soon.',
      messageFailed: 'Failed to send message',
      deliveryTitle: 'Delivery Information',
      delivery: {
        localTitle: 'Local Delivery',
        localDesc1: 'Within 10km radius',
        localDesc2: 'Next-day delivery available',
        regionalTitle: 'Regional Delivery',
        regionalDesc1: '51-60km distance',
        regionalDesc2: '2 delivery days per week',
        nationalTitle: 'National Shipping',
        calculated: 'Calculated',
        nationalDesc1: 'By weight and zone',
        nationalDesc2: 'Weekly dispatch schedule',
        minimumLabel: 'Minimum Order:'
      }
    },
    about: {
      title: 'About Goodrich Farm',
      subtitle: 'A family-run poultry farm committed to quality, animal welfare, and community growth',
      storyTitle: 'Our Story',
      storyPara1: 'Our chicken farm was founded with one simple goal: to raise healthy chickens using responsible, honest farming practices. What began as a small family effort has grown into a trusted local poultry farm serving households, restaurants, and markets with pride.',
      storyPara2: 'From day one, we focused on quality over quantity, learning from experience, tradition, and modern farming methods to build a farm our community can trust.',
      whoTitle: 'Who We Are',
      whoPara1: 'We are a family-run poultry farm supported by a dedicated team of farmers, caretakers, and animal health professionals. Every member of our team plays a role in ensuring our chickens are raised in a clean, safe, and stress-free environment.',
      whoPara2: 'Our hands-on approach means we are involved in every stage from chick care to feeding, health monitoring, and delivery.',
      missionTitle: 'Our Mission',
      missionDesc: 'To produce high-quality, healthy chicken products while maintaining ethical farming practices, protecting animal welfare, and supporting our local community.',
      visionTitle: 'Our Vision',
      visionDesc: 'To become a leading and trusted poultry farm known for quality, transparency, and sustainable farming practices.',
      valuesTitle: 'Our Values',
      valuesList: ['Animal Welfare', 'Quality and Safety', 'Honesty and Transparency', 'Sustainability', 'Community Support'],
      farmTitle: 'Our Farm',
      locationTitle: 'Location',
      locationLine1: 'Eastern Province, Kayonza District',
      locationLine2: 'Rukara Sector, Kawangire Cell',
      capacityTitle: 'Farm Capacity',
      capacityDesc: 'We are able to keep 5,000 chickens at capacity',
      farmDesc: 'Our farm is designed to allow proper space, ventilation, and hygiene, ensuring our chickens grow in a healthy and comfortable environment.',
      communityTitle: 'Community Involvement',
      communityIntro: 'We actively support our local community by:',
      community: {
        reliableTitle: 'Reliable Supply',
        reliableDesc: 'Providing reliable poultry supply to local markets',
        jobsTitle: 'Job Creation',
        jobsDesc: 'Creating job opportunities in our community',
        supportTitle: 'Business Support',
        supportDesc: 'Supporting small businesses and households',
        knowledgeTitle: 'Knowledge Sharing',
        knowledgeDesc: 'Sharing knowledge on poultry farming best practices'
      },
      communityClosing: 'We believe strong farms build strong communities.',
      commitmentTitle: 'Our Commitment to Quality',
      commitmentDesc: 'Quality is not a promise it is our daily practice.',
      founderTitle: 'Meet Our Founder',
      founderName: 'HABAKURAMA Jean de Dieu',
      founderRole: 'Founder and Head Farmer',
      founderDesc: 'Leading Goodrich Farm with passion, dedication, and a commitment to excellence in poultry farming.'
    },
    checkout: {
      signInRequired: 'Please sign in to continue checkout',
      fillRequired: 'Please fill in all required fields',
      savedProceeding: 'Order details saved. Proceeding to payment...',
      syncFailed: 'Failed to sync customer',
      title: 'Checkout',
      subtitle: 'Complete your order and arrange delivery',
      customerInfo: 'Customer Information',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Your full name',
      phoneNumber: 'Phone Number',
      phonePlaceholder: 'Enter your phone number',
      emailAddress: 'Email Address',
      emailPlaceholder: 'your@email.com',
      deliveryInfo: 'Delivery Information',
      deliveryAddress: 'Delivery Address',
      deliveryAddressPlaceholder: 'Enter your complete delivery address',
      deliveryZone: 'Delivery Zone',
      zone: {
        local: 'Local (10km) - 3,000 FRW',
        regional: 'Regional (51-60km) - 10,000 FRW',
        national: 'National - 15,000 FRW'
      },
      preferredDate: 'Preferred Delivery Date',
      preferredWindow: 'Preferred Time Window',
      window: {
        morning: '9:00 AM - 12:00 PM',
        midday: '12:00 PM - 3:00 PM',
        afternoon: '3:00 PM - 6:00 PM'
      },
      additionalNotes: 'Additional Notes',
      notesPlaceholder: 'Any special instructions or notes for delivery...',
      backToCart: 'Back to Cart',
      proceedPayment: 'Proceed to Payment',
      orderSummary: 'Order Summary',
      qtyLabel: 'Qty:',
      subtotal: 'Subtotal:',
      deliveryFee: 'Delivery Fee:',
      total: 'Total:',
      deliveryDateHint: 'Deliver on your chosen date',
      deliveryWindowHint: 'Within your preferred time window'
    },
    payment: {
      signInRequired: 'Please sign in to continue payment',
      createRequestFailed: 'Failed to create payment request',
      missingReference: 'Missing payment reference',
      submitted: 'Payment request submitted. Admin will review your payment.',
      submitFailed: 'Failed to submit payment',
      submittedTitle: 'Payment Submitted',
      submittedDesc: 'We have received your payment request. Admin will confirm once the transfer is received.',
      reference: 'Reference',
      amount: 'Amount',
      window: 'Payment window',
      until: 'Until',
      viewOrderStatus: 'View Order Status',
      title: 'Manual Payment',
      subtitle: 'Pay with MTN Mobile Money and submit your request.',
      sendTitle: 'Send MTN MoMo Payment',
      sendDesc: 'Send your payment within {{minutes}} minutes to keep your order active.',
      receiverNumber: 'Receiver Number',
      receiverName: 'Receiver Name',
      copy: 'Copy',
      important: 'Important',
      importantLine1: 'After paying, click I Have Paid so admin can approve your order.',
      importantLine2: 'Approval happens after the payment is confirmed on our side.',
      backToCheckout: 'Back to Checkout',
      submitting: 'Submitting...',
      iHavePaid: 'I Have Paid',
      orderSummary: 'Order Summary',
      qty: 'Qty:',
      subtotal: 'Subtotal:',
      deliveryFee: 'Delivery Fee:',
      total: 'Total:',
      windowTitle: 'Payment Window',
      windowDesc: 'Send payment within {{minutes}} minutes, then submit your request.'
    },
    login: {
      adminLoggedIn: 'Admin is logged in. Log out admin first.',
      fillAll: 'Please fill in all fields',
      passwordMismatch: 'Passwords do not match',
      authFailed: 'Authentication failed',
      success: 'Login successful!',
      createdSuccess: 'Account created successfully!',
      welcomeBack: 'Welcome Back',
      createAccount: 'Create Account',
      signInDesc: 'Sign in to your account to continue shopping',
      createDesc: 'Join us for fresh eggs delivered to your doorstep',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Your full name',
      emailAddress: 'Email Address',
      emailPlaceholder: 'your@email.com',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Confirm your password',
      forgotPassword: 'Forgot Password?',
      pleaseWait: 'Please wait...',
      signIn: 'Sign In',
      noAccount: "Don't have an account?",
      haveAccount: 'Already have an account?',
      continueShopping: 'Continue Shopping Instead'
    },
    forgot: {
      enterEmail: 'Please enter your email',
      requestFailed: 'Failed to request reset',
      requestReceived: 'Request received. Admin will send your reset code.',
      title: 'Forgot Password',
      subtitle: 'Enter your email to request a reset code',
      emailAddress: 'Email Address',
      emailPlaceholder: 'your@email.com',
      pleaseWait: 'Please wait...',
      requestCode: 'Request Reset Code',
      backToSignIn: 'Back to Sign In'
    },
    reset: {
      fillAll: 'Please fill in all fields',
      passwordMismatch: 'Passwords do not match',
      passwordLength: 'Password must be at least 6 characters',
      failed: 'Failed to reset password',
      success: 'Password updated. Please sign in.',
      title: 'Reset Password',
      subtitle: 'Enter your email and reset code from admin',
      emailAddress: 'Email Address',
      emailPlaceholder: 'your@email.com',
      resetCode: 'Reset Code',
      resetCodePlaceholder: 'Enter reset code',
      newPassword: 'New Password',
      newPasswordPlaceholder: 'Enter new password',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Confirm new password',
      pleaseWait: 'Please wait...',
      resetPassword: 'Reset Password',
      backToSignIn: 'Back to Sign In'
    },
    account: {
      nameEmailRequired: 'Name and email are required',
      profileUpdated: 'Profile updated',
      profileUpdateFailed: 'Failed to update profile',
      chooseImage: 'Please choose an image file',
      photoUploaded: 'Profile photo uploaded',
      photoUploadFailed: 'Failed to upload profile photo',
      title: 'My Account',
      subtitle: 'Manage your profile and keep your order history private.',
      customerId: 'Customer ID',
      totalOrders: 'Total Orders',
      totalPaid: 'Total Paid',
      viewOrderHistory: 'View Order History',
      logout: 'Logout',
      profileDetails: 'Profile Details',
      fullName: 'Full Name',
      emailAddress: 'Email Address',
      phoneNumber: 'Phone Number',
      profilePhoto: 'Profile Photo',
      uploadingPhoto: 'Uploading photo...',
      saving: 'Saving...',
      saveChanges: 'Save Changes'
    },
    orders: {
      historyCleared: 'Order history cleared',
      clearFailed: 'Failed to clear order history',
      retryStarted: 'Payment retry started. New ref: {{ref}}',
      retryFailed: 'Failed to retry payment',
      title: 'Order History',
      subtitle: 'Track your orders and their delivery status',
      paymentRequests: 'Payment Requests',
      ref: 'Ref',
      amount: 'Amount',
      status: 'Status',
      expires: 'Expires',
      retryPayment: 'Retry Payment',
      noOrders: 'No Orders Yet',
      noOrdersDesc: "You haven't placed any orders yet. Start shopping now!",
      browseProducts: 'Browse Products',
      filterByStatus: 'Filter by Status',
      allOrders: 'All Orders',
      clearHistory: 'Clear History',
      noneForStatus: 'No orders found with selected status',
      orderId: 'Order ID',
      orderDate: 'Order Date',
      totalAmount: 'Total Amount',
      items: 'Items',
      pieces: 'pieces',
      deliveryAddress: 'Delivery Address',
      deliveryDate: 'Delivery Date',
      viewDetails: 'View Details',
      customerInformation: 'Customer Information',
      name: 'Name',
      orderItems: 'Order Items',
      quantity: 'Quantity',
      subtotal: 'Subtotal',
      deliveryFee: 'Delivery Fee',
      total: 'Total',
      notes: 'Notes',
      continueShopping: 'Continue Shopping'
    },
    admin: {
      userLoggedIn: 'User is logged in. Log out user account first.',
      invalidCredentials: 'Invalid admin credentials.',
      loginTitle: 'Admin Login',
      loginSubtitle: 'Enter your credentials to access the admin dashboard',
      username: 'Username',
      usernamePlaceholder: 'Enter username',
      password: 'Password',
      passwordPlaceholder: 'Enter password',
      login: 'Login',
      dashboardTitle: 'Admin Dashboard',
      dashboardSubtitle: 'Goodrich Chicken Farm Management',
      tabs: {
        dashboard: 'Dashboard',
        orders: 'Orders',
        payments: 'Payments',
        inventory: 'Inventory',
        passwordResets: 'Password Resets',
        announcements: 'Announcements',
        messages: 'Messages',
        gallery: 'Gallery',
        customers: 'Customers',
        accounts: 'Customer Accounts',
        reports: 'Reports'
      }
    }
  },
  rw: {
    header: {
      brand: 'Goodrich',
      tagline: 'Amagi mashya yo mu bworozi',
      nav: {
        home: 'Ahabanza',
        about: 'Abo turi bo',
        practices: 'Imikorere yacu',
        shop: 'Iduka',
        gallery: 'Amafoto',
        contact: 'Twandikire'
      },
      language: {
        label: 'Hitamo ururimi',
        rw: 'Kinyarwanda',
        en: ' English',
        sw: 'Kiswahili',
        fr: 'French'
      },
      account: {
        myAccount: 'Konti yanjye',
        signIn: 'Injira'
      },
      role: {
        admin: 'Umuyobozi',
        adminMode: "Uburyo bw'umuyobozi",
        user: 'Umukoresha'
      },
      logout: 'Sohoka',
      cartTitle: 'Ibiri mu gitebo: {{items}} * Trays: {{trays}}',
      logoAlt: 'Ikirango cya Goodrich Farm'
    },
    splash: {
      farmName: 'HABAKURAMA Jean de Dieu',
      title: "Amagi mashya avuye ku bworozi bwizewe",
      subtitle: "Turimo gutegura ibicuruzwa byiza n'itangwa ryabyo..."
    },
    farmPractices: {
      heroTitle: 'Imikorere yacu mu bworozi',
      heroDescription:
        "Ubworozi buboneye si umuco uhita - ni ihame ryacu. Ibyo dukora byose birinda ubuzima bw'amatungo, ubuziranenge bw'ibiribwa n'ibidukikije.",
      animalWelfareTitle: "Imibereho myiza y'inkoko",
      animalWelfareIntro: "Twemera ko inkoko zikura neza iyo ziri ahantu heza kandi hameze nk'ibidukikije byazo.",
      freeRangeTitle: 'Ubworozi bwo kurekura inkoko',
      freeRangeDescription:
        "Inkoko zacu zororerwa zifite umudendezo, zigakora imyitwarire yazo isanzwe kandi zigabanya guhangayika.",
      coopTitle: 'Isuku n umwanya mu biraro',
      coopList: [
        'Ibiraso bisukuye kandi biteguwe neza',
        "Umwanya uhagije kuri buri nkoko kugirango hatabaho ubucucike",
        'Isukura rihoraho n ingamba zo kwirinda indwara'
      ],
      ventilationTitle: 'Urumuri rusanzwe n umwuka mwiza',
      ventilationLead: 'Inzu zororerwamo zacu zateguwe kugira ngo:',
      ventilationList: [
        'Zinjize urumuri rusanzwe ruhagije',
        'Hatembere umwuka mwiza igihe cyose',
        "Hagumane ubushyuhe n'ubushuhe bikwiye"
      ],
      nutritionTitle: 'Ibiryo n intungamubiri',
      nutritionIntro: "Intungamubiri zigira uruhare rukomeye ku buzima bw'inkoko n'ubuziranenge bw'ibicuruzwa.",
      nonGmoTitle: 'Ibiryo bitarimo GMO',
      nonGmoDescription:
        "Dukoresha ibiryo byatoranyijwe neza bitarimo GMO kugira ngo inkoko zikure neza mu buryo busanzwe.",
      noAntibioticsTitle: 'Nta hormones cyangwa antibiotique zisanzwe',
      noAntibioticsList: [
        'Nta growth hormones',
        'Nta gukoresha antibiotique bya buri gihe',
        'Imiti ikoreshwa gusa igihe bikenewe kandi bikurikije inama za veterineri'
      ],
      supplementsTitle: 'Inyunganiramirire karemano',
      supplementsLead: 'Gahunda yacu yo kugaburira ikubiyemo:',
      supplementsList: [
        'Vitamini n imyunyungugu',
        'Inyunganiramubiri zongera ubudahangarwa',
        'Protein zingana neza ku mikurire myiza'
      ],
      sustainabilityTitle: 'Kurengera ibidukikije',
      sustainabilityIntro:
        'Twiyemeje ubworozi burinda ibidukikije ku nyungu z ibisekuru bizaza.',
      wasteTitle: 'Gucunga imyanda',
      wasteList: [
        'Gufata no kongera gukoresha imyanda y inkoko neza',
        'Gukoresha imyanda kama mu ifumbire no gukomeza ubutaka',
        'Uburyo bwo kujugunya busukuye burinda ihumana'
      ],
      waterTitle: 'Kubungabunga amazi',
      waterList: [
        'Uburyo bugenzurwa bwo gukoresha amazi',
        'Ubugenzuzi buhoraho bwo kwirinda gupfusha ubusa',
        'Amazi meza kandi atekanye ku nkoko zose'
      ],
      ctaTitle: 'Menya itandukaniro',
      ctaDescription:
        "Ukwiyemeza kwacu ku bworozi buboneye bitanga inkoko nzima n'amagi meza ku muryango wawe.",
      stats: {
        chickens: "Ubushobozi bw'inkoko",
        freeRange: 'Zirekuwe',
        antibiotics: 'Antibiotique zakoreshejwe'
      }
    },
    footer: {
      brand: 'Goodrich Farm',
      about: 'Ubworozi bwiza bw inkoko bukurikiza amabwiriza meza. Amagi mashya akugezwaho aho uri.',
      quickLinks: 'Imiyoboro yihuse',
      contactTitle: 'Twandikire',
      addressLine1: 'Intara y Iburasirazuba, Akarere ka Kayonza',
      addressLine2: 'Umurenge wa Rukara, Akagari ka Kawangire',
      deliveryTitle: 'Ahagezwa ibicuruzwa',
      delivery: {
        local: 'Hafi (10km): 3,000 FRW',
        regional: 'Akarere (51-60km): 10,000 FRW',
        national: 'Igihugu hose: Bibarwa',
        minimumLabel: 'Itegeko rito:',
        minimumValue: '4,500 FRW'
      }
    },
    home: {
      heroBadge: 'Biva ku bworozi bwacu bijya ku meza yawe',
      heroTitle1: 'Ubwiza buhambaye',
      heroTitle2: 'Amagi mashya yo ku bworozi',
      shopNow: 'Gura ubu',
      learnMore: 'Menya byinshi',
      productsTitle: 'Amagi yacu meza',
      viewDetails: 'Reba birambuye',
      viewAllProducts: 'Reba ibicuruzwa byose',
      announcementsTitle: 'Amatangazo mashya',
      testimonialsTitle: 'Ibyo abakiliya bavuga',
      ctaTitle: 'Witeguye gutumiza amagi mashya?',
      startShopping: 'Tangira guhaha',
      contactUs: 'Twandikire'
    },
    shop: {
      filters: {
        all: 'Ingano zose',
        small: 'Nto',
        medium: 'Hagati',
        large: 'Nini',
        extraLarge: 'Nini cyane'
      },
      heroTitle: 'Gura amagi mashya',
      noProducts: 'Nta bicuruzwa bibonetse',
      inCart: 'Mu gitebo',
      lowStock: 'Stock iri hasi',
      stock: 'Stock',
      trays: 'Trays',
      outOfStock: 'Byarangiye',
      addToCart: 'Shyira mu gitebo',
      whyTitle: 'Kuki wahitamo amagi yacu?'
    },
    gallery: {
      filters: {
        all: 'Amafoto yose',
        facilities: 'Ibikorwaremezo',
        chickens: 'Inkoko zacu',
        team: 'Itsinda ryacu',
        eggs: 'Amagi mashya'
      },
      heroTitle: 'Galeriya y ubworozi',
      empty: 'Nta mafoto muri iki cyiciro',
      visitTitle: 'Sura ubworozi bwacu',
      visitCall: 'Hamagara 0788455886 utegure uruzinduko'
    },
    cart: {
      empty: 'Igitebo cyawe ntakirimo ikintu',
      browseProducts: 'Reba ibicuruzwa',
      title: 'Igitebo cy ibicuruzwa',
      itemsTitle: 'Ibiri mu gitebo',
      remove: 'Kuraho',
      summaryTitle: 'Incamake y itegeko',
      subtotal: 'Igiteranyo',
      total: 'Byose hamwe',
      proceed: 'Komeza ujye kuri checkout',
      continueShopping: 'Komeza guhaha'
    },
    announcements: {
      title: 'Amatangazo mashya',
      emptyTitle: 'Nta matangazo araboneka',
      by: 'Byanditswe na',
      date: 'Itariki',
      time: 'Igihe',
      backHome: 'Subira ahabanza'
    },
    contact: {
      title: 'Twandikire',
      getInTouch: 'Tuganire',
      sendMessageTitle: 'Twoherereze ubutumwa',
      form: {
        nameLabel: 'Amazina yawe',
        emailLabel: 'Imeyili',
        phoneLabel: 'Telefone',
        messageLabel: 'Ubutumwa',
        send: 'Ohereza ubutumwa',
        sending: 'Birimo koherezwa...'
      },
      deliveryTitle: 'Amakuru y itangwa'
    },
    about: {
      title: 'Ibyerekeye Goodrich Farm',
      storyTitle: 'Amateka yacu',
      whoTitle: 'Turi bande',
      missionTitle: 'Intego yacu',
      visionTitle: 'Icyerekezo cyacu',
      valuesTitle: 'Indangagaciro zacu',
      farmTitle: 'Ubworozi bwacu',
      communityTitle: 'Uruhare mu muryango',
      commitmentTitle: 'Ukwiyemeza ubuziranenge',
      founderTitle: 'Hura n uwashinze'
    }
  },
  sw: {
    header: {
      brand: 'Goodrich',
      tagline: 'Mayai mapya ya shamba',
      nav: {
        home: 'Nyumbani',
        about: 'Kuhusu sisi',
        practices: 'Mbinu za shamba',
        shop: 'Duka',
        gallery: 'Picha',
        contact: 'Wasiliana'
      },
      language: {
        label: 'Chagua lugha',
       rw: 'Kinyarwanda',
        en: ' English',
        sw: 'Kiswahili',
        fr: 'French'
      },
      account: {
        myAccount: 'Akaunti yangu',
        signIn: 'Ingia'
      },
      role: {
        admin: 'Msimamizi',
        adminMode: 'Hali ya msimamizi',
        user: 'Mtumiaji'
      },
      logout: 'Toka',
      cartTitle: 'Vipengee: {{items}} * Trays: {{trays}}',
      logoAlt: 'Nembo ya Goodrich Farm'
    },
    splash: {
      farmName: 'HABAKURAMA Jean de Dieu',
      title: 'Mayai mapya kutoka shamba linaloaminika',
      subtitle: 'Tunaandaa bidhaa bora za shamba na huduma za usafirishaji...'
    },
    farmPractices: {
      heroTitle: 'Mbinu zetu za ufugaji',
      heroDescription:
        'Ufugaji wenye uwajibikaji si mtindo - ni kiwango chetu. Kila tunachofanya kinalinda ustawi wa wanyama, usalama wa chakula na mazingira.',
      animalWelfareTitle: 'Ustawi wa wanyama',
      animalWelfareIntro: 'Tunaamini kuku wenye afya hukua vizuri kwenye mazingira mazuri na ya asili.',
      freeRangeTitle: 'Ufugaji wa kuachiwa huru',
      freeRangeDescription:
        'Kuku wetu hufugwa kwa mfumo wa kuachiwa huru ili wasogee kwa uhuru, waonyeshe tabia zao za asili na waishi bila msongo.',
      coopTitle: 'Hali ya banda na nafasi',
      coopList: [
        'Makazi safi na yanayotunzwa vizuri',
        'Nafasi ya kutosha kwa kila kuku ili kuepuka msongamano',
        'Usafi wa mara kwa mara na hatua za kinga ya magonjwa'
      ],
      ventilationTitle: 'Mwanga wa asili na hewa safi',
      ventilationLead: 'Mabanda yetu yameundwa ili:',
      ventilationList: [
        'Yapate mwanga wa kutosha wa asili',
        'Yahakikishe mzunguko wa hewa safi muda wote',
        'Yadumishe joto na unyevunyevu salama'
      ],
      nutritionTitle: 'Lishe na virutubisho',
      nutritionIntro: 'Lishe ina nafasi muhimu kwa afya ya wanyama na ubora wa bidhaa.',
      nonGmoTitle: 'Chakula kisicho na GMO',
      nonGmoDescription:
        'Tunatumia viambato vya chakula visivyo na GMO vilivyochaguliwa kwa umakini ili kuku wakue kwa asili.',
      noAntibioticsTitle: 'Hakuna antibiotics au homoni',
      noAntibioticsList: [
        'Hakuna homoni za ukuaji',
        'Hakuna matumizi ya kawaida ya antibiotic',
        'Dawa hutumika tu pale inapohitajika chini ya ushauri wa daktari wa mifugo'
      ],
      supplementsTitle: 'Virutubisho vya asili',
      supplementsLead: 'Mpango wetu wa lishe unajumuisha:',
      supplementsList: [
        'Vitamini na madini',
        'Virutubisho vya asili vya kuongeza kinga',
        'Vyanzo vya protini vilivyopimwa kwa ukuaji bora'
      ],
      sustainabilityTitle: 'Uendelevu',
      sustainabilityIntro: 'Tumejitoa kwa ufugaji unaolinda mazingira kwa vizazi vijavyo.',
      wasteTitle: 'Usimamizi wa taka',
      wasteList: [
        'Utunzaji sahihi na urejelezaji wa taka za kuku',
        'Matumizi ya taka za kikaboni kwa mboji na kuboresha udongo',
        'Mifumo safi ya utupaji ili kuzuia uchafuzi wa mazingira'
      ],
      waterTitle: 'Uhifadhi wa maji',
      waterList: [
        'Mifumo ya matumizi ya maji inayodhibitiwa',
        'Ufuatiliaji wa mara kwa mara kuzuia upotevu',
        'Maji safi na salama kwa kuku wote'
      ],
      ctaTitle: 'Onja tofauti',
      ctaDescription:
        'Kujitolea kwetu kwa ufugaji wenye uwajibikaji kunamaanisha kuku wenye afya na mayai bora kwa familia yako.',
      stats: {
        chickens: 'Uwezo wa kuku',
        freeRange: 'Wanaoachiwa huru',
        antibiotics: 'Antibiotic zilizotumika'
      }
    },
    footer: {
      quickLinks: 'Viungo vya haraka',
      contactTitle: 'Wasiliana nasi',
      deliveryTitle: 'Maeneo ya usafirishaji'
    },
    home: {
      heroBadge: 'Kutoka shambani kwetu hadi mezani kwako',
      heroTitle1: 'Ubora wa juu',
      heroTitle2: 'Mayai mapya ya shamba',
      shopNow: 'Nunua sasa',
      learnMore: 'Jifunze zaidi',
      productsTitle: 'Mayai yetu bora',
      viewAllProducts: 'Tazama bidhaa zote',
      announcementsTitle: 'Matangazo mapya',
      testimonialsTitle: 'Wateja wetu wanasema nini',
      ctaTitle: 'Uko tayari kuagiza mayai mapya?',
      startShopping: 'Anza kununua',
      contactUs: 'Wasiliana nasi'
    },
    shop: {
      filters: {
        all: 'Ukubwa wote',
        small: 'Ndogo',
        medium: 'Wastani',
        large: 'Kubwa',
        extraLarge: 'Kubwa sana'
      },
      heroTitle: 'Nunua mayai mapya',
      inCart: 'Kwenye kikapu',
      lowStock: 'Stoo ndogo',
      stock: 'Stoo',
      trays: 'Treyi',
      addToCart: 'Ongeza kwenye kikapu',
      outOfStock: 'Imeisha'
    },
    gallery: {
      filters: {
        all: 'Picha zote',
        facilities: 'Miundombinu ya shamba',
        chickens: 'Kuku wetu',
        team: 'Timu yetu',
        eggs: 'Mayai mapya'
      },
      heroTitle: 'Galeria ya shamba',
      empty: 'Hakuna picha katika kundi hili',
      visitTitle: 'Tembelea shamba letu'
    },
    cart: {
      empty: 'Kikapu chako ni tupu',
      browseProducts: 'Tazama bidhaa',
      title: 'Kikapu cha manunuzi',
      itemsTitle: 'Bidhaa kikapuni',
      remove: 'Ondoa',
      summaryTitle: 'Muhtasari wa oda',
      subtotal: 'Jumla ndogo',
      total: 'Jumla',
      proceed: 'Endelea Checkout',
      continueShopping: 'Endelea kununua'
    },
    announcements: {
      title: 'Matangazo mapya',
      emptyTitle: 'Bado hakuna matangazo',
      by: 'Na',
      date: 'Tarehe',
      time: 'Muda',
      backHome: 'Rudi nyumbani'
    },
    contact: {
      title: 'Wasiliana nasi',
      getInTouch: 'Wasiliana',
      sendMessageTitle: 'Tutumie ujumbe',
      form: {
        nameLabel: 'Jina lako',
        emailLabel: 'Barua pepe',
        phoneLabel: 'Namba ya simu',
        messageLabel: 'Ujumbe',
        send: 'Tuma ujumbe',
        sending: 'Inatuma...'
      },
      deliveryTitle: 'Taarifa za usafirishaji'
    },
    about: {
      title: 'Kuhusu Goodrich Farm',
      storyTitle: 'Hadithi yetu',
      whoTitle: 'Sisi ni nani',
      missionTitle: 'Dhamira yetu',
      visionTitle: 'Maono yetu',
      valuesTitle: 'Maadili yetu',
      farmTitle: 'Shamba letu',
      communityTitle: 'Ushiriki wa jamii',
      commitmentTitle: 'Ahadi yetu ya ubora',
      founderTitle: 'Kutana na mwanzilishi'
    }
  },
  fr: {
    header: {
      brand: 'Goodrich',
      tagline: 'Oeufs frais de la ferme',
      nav: {
        home: 'Accueil',
        about: 'A propos',
        practices: 'Pratiques de ferme',
        shop: 'Boutique',
        gallery: 'Galerie',
        contact: 'Contact'
      },
      language: {
        label: 'Choisir la langue',
       rw: 'Kinyarwanda',
        en: ' English',
        sw: 'Kiswahili',
        fr: 'French'
      },
      account: {
        myAccount: 'Mon compte',
        signIn: 'Se connecter'
      },
      role: {
        admin: 'Admin',
        adminMode: 'Mode admin',
        user: 'Utilisateur'
      },
      logout: 'Deconnexion',
      cartTitle: 'Articles: {{items}} * Trays: {{trays}}',
      logoAlt: 'Logo Goodrich Farm'
    },
    splash: {
      farmName: 'HABAKURAMA Jean de Dieu',
      title: 'Des oeufs frais, un elevage fiable',
      subtitle: 'Preparation des produits fermiers de qualite et du service de livraison...'
    },
    farmPractices: {
      heroTitle: 'Nos pratiques de ferme',
      heroDescription:
        "L'elevage responsable n'est pas une tendance - c'est notre norme. Chaque pratique protege le bien-etre animal, la securite alimentaire et l'environnement.",
      animalWelfareTitle: 'Bien-etre animal',
      animalWelfareIntro: 'Nous pensons que des poules en bonne sante grandissent mieux dans un environnement naturel et confortable.',
      freeRangeTitle: 'Elevage en plein air',
      freeRangeDescription:
        'Nos poules sont elevees en plein air pour bouger librement, exprimer leurs comportements naturels et vivre avec moins de stress.',
      coopTitle: 'Conditions et espace des poulaillers',
      coopList: [
        'Logements propres et bien entretenus',
        'Espace suffisant par oiseau pour eviter la surpopulation',
        'Assainissement regulier et mesures de biosecurite'
      ],
      ventilationTitle: 'Lumiere naturelle et ventilation',
      ventilationLead: 'Nos poulaillers sont concus pour :',
      ventilationList: [
        'Maximiser la lumiere du jour',
        "Assurer une circulation d'air frais continue",
        "Maintenir une temperature et une humidite sures"
      ],
      nutritionTitle: 'Alimentation et nutrition',
      nutritionIntro: "La nutrition joue un role cle dans la sante animale et la qualite du produit.",
      nonGmoTitle: 'Aliment sans OGM',
      nonGmoDescription:
        'Nous utilisons des ingredients sans OGM soigneusement choisis pour favoriser une croissance naturelle et une bonne sante des volailles.',
      noAntibioticsTitle: "Sans antibiotiques ni hormones",
      noAntibioticsList: [
        'Aucune hormone de croissance',
        "Aucun usage routinier d'antibiotiques",
        'Les medicaments sont utilises seulement si necessaire sous supervision veterinaire'
      ],
      supplementsTitle: 'Supplements naturels',
      supplementsLead: "Notre programme d'alimentation comprend :",
      supplementsList: [
        'Vitamines et mineraux',
        "Supplements naturels pour renforcer l'immunite",
        'Sources de proteines equilibrees pour un developpement sain'
      ],
      sustainabilityTitle: 'Durabilite',
      sustainabilityIntro:
        "Nous nous engageons pour un elevage qui protege l'environnement pour les generations futures.",
      wasteTitle: 'Gestion des dechets',
      wasteList: [
        'Traitement et recyclage corrects des dechets avicoles',
        'Utilisation des dechets organiques pour le compost et la fertilite des sols',
        'Systemes propres de rejet pour eviter la contamination'
      ],
      waterTitle: "Conservation de l'eau",
      waterList: [
        "Systemes controles d'utilisation de l'eau",
        'Suivi regulier pour eviter le gaspillage',
        'Approvisionnement en eau propre et sure pour toutes les volailles'
      ],
      ctaTitle: 'Voyez la difference',
      ctaDescription:
        'Notre engagement pour un elevage responsable signifie des poules plus saines et de meilleurs oeufs pour votre famille.',
      stats: {
        chickens: 'Capacite de poules',
        freeRange: 'Plein air',
        antibiotics: 'Antibiotiques utilises'
      }
    },
    footer: {
      quickLinks: 'Liens rapides',
      contactTitle: 'Contactez-nous',
      deliveryTitle: 'Zones de livraison'
    },
    home: {
      heroBadge: 'De notre ferme a votre table',
      heroTitle1: 'Qualite premium',
      heroTitle2: 'Oeufs frais de la ferme',
      shopNow: 'Acheter maintenant',
      learnMore: 'En savoir plus',
      productsTitle: 'Nos oeufs premium',
      viewAllProducts: 'Voir tous les produits',
      announcementsTitle: 'Dernieres annonces',
      testimonialsTitle: 'Ce que disent nos clients',
      ctaTitle: 'Pret a commander des oeufs frais ?',
      startShopping: 'Commencer les achats',
      contactUs: 'Contactez-nous'
    },
    shop: {
      filters: {
        all: 'Toutes tailles',
        small: 'Petit',
        medium: 'Moyen',
        large: 'Grand',
        extraLarge: 'Tres grand'
      },
      heroTitle: 'Acheter des oeufs frais',
      inCart: 'Dans le panier',
      lowStock: 'Stock faible',
      stock: 'Stock',
      trays: 'Plateaux',
      addToCart: 'Ajouter au panier',
      outOfStock: 'Rupture de stock'
    },
    gallery: {
      filters: {
        all: 'Toutes les photos',
        facilities: 'Installations',
        chickens: 'Nos poules',
        team: 'Notre equipe',
        eggs: 'Oeufs frais'
      },
      heroTitle: 'Galerie de la ferme',
      empty: 'Aucune photo dans cette categorie',
      visitTitle: 'Visitez notre ferme'
    },
    cart: {
      empty: 'Votre panier est vide',
      browseProducts: 'Voir les produits',
      title: 'Panier',
      itemsTitle: 'Articles du panier',
      remove: 'Supprimer',
      summaryTitle: 'Resume de la commande',
      subtotal: 'Sous-total',
      total: 'Total',
      proceed: 'Passer a la commande',
      continueShopping: 'Continuer les achats'
    },
    announcements: {
      title: 'Dernieres annonces',
      emptyTitle: 'Aucune annonce',
      by: 'Par',
      date: 'Date',
      time: 'Heure',
      backHome: 'Retour a l accueil'
    },
    contact: {
      title: 'Contactez-nous',
      getInTouch: 'Entrer en contact',
      sendMessageTitle: 'Envoyez-nous un message',
      form: {
        nameLabel: 'Votre nom',
        emailLabel: 'Adresse e-mail',
        phoneLabel: 'Numero de telephone',
        messageLabel: 'Message',
        send: 'Envoyer le message',
        sending: 'Envoi...'
      },
      deliveryTitle: 'Informations de livraison'
    },
    about: {
      title: 'A propos de Goodrich Farm',
      storyTitle: 'Notre histoire',
      whoTitle: 'Qui sommes-nous',
      missionTitle: 'Notre mission',
      visionTitle: 'Notre vision',
      valuesTitle: 'Nos valeurs',
      farmTitle: 'Notre ferme',
      communityTitle: 'Implication communautaire',
      commitmentTitle: 'Notre engagement qualite',
      founderTitle: 'Rencontrez le fondateur'
    }
  }
};

const isObject = (value: unknown): value is TranslationNode => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const lookup = (language: SupportedLanguage, key: string): TranslationValue | undefined => {
  const source = translations[language];
  const parts = key.split('.');
  let current: TranslationNode | TranslationValue = source;

  for (const part of parts) {
    if (!isObject(current)) {
      return undefined;
    }
    current = current[part];
    if (current === undefined) {
      return undefined;
    }
  }

  if (typeof current === 'string' || Array.isArray(current)) {
    return current;
  }
  return undefined;
};

export const getTranslationValue = (language: SupportedLanguage, key: string): TranslationValue | undefined => {
  return lookup(language, key) ?? lookup('en', key);
};
