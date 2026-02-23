
declare global {
  /**
   * Data type identifier - fully dynamic string type
   * All data types are defined dynamically in de.json under "dataTypes"
   * No need to update this type when adding new data types - just add them to de.json
   * 
   * @example
   * 
   * "dataTypes": {
   *   "myNewType": { ... }
   * }
   * 
   * const dataType: DataType = "myNewType";
   */
  type DataType = string;
  type JsonData = Record<string, unknown>;

  /**
   * Interface for global loading state
   */
  interface GlobalLoadingState {
    isLoading: boolean;
    loadingMessage: string;
    setLoading: (loading: boolean, message?: string) => void;
    setLoadingMessage: (message: string) => void;
  }


  /**
   * Base interface for all items with common properties
   */
  interface BaseItem {
    id: string;
    createdAt: string;
    updatedAt: string;
    isArchive: boolean;
  }

  interface GenericJsonItem extends BaseItem {
    [key: string]: unknown | unknown[];
  }

  /**
   * Union type for all possible data items - now fully dynamic
   * All data items use GenericJsonItem which extends BaseItem (id, createdAt, updatedAt, isArchive)
   * Additional fields are defined dynamically via JSON configuration (de.json)
   */
  type DataItem = GenericJsonItem;


  /**
   * Base interface for all form fields
   */
  interface BaseField {
    key: string;
    label: string;
  }

  /**
   * Option for select fields
   */
  interface FormFieldOption {
    value: string;
    label: string;
  }

  /**
   * Configuration for array fields
   */
  interface ArrayFieldConfig {
    itemLabel: string;
    fields: ArrayFieldItem[];
  }

  /**
   * Single item in an array field
   */
  interface ArrayFieldItem extends BaseField {
    type: "text" | "number" | "email" | "tel" | "url" | "date" | "time" | "datetime";
    required?: boolean;
    placeholder?: string;
    onFocused?: boolean;
    step?: number;
    min?: number;
    max?: number;
  }

  /**
   * Data for array items
   */
  interface ArrayItemData {
    [key: string]: string | number;
  }


  type FormField = GenericFormField;
  type DisplayField = GenericDisplayField;
  type DataTypeConfig = GenericDataTypeConfig;


  /**
   * Base interface for navigation items
   */
  interface BaseNavigationItem {
    key: string;
    title: string;
    icon: string;
  }

  /**
   * Sub-navigation item
   */
  interface NavigationSubItem extends BaseNavigationItem {
    path?: string;
    type?: "dropdown";
    subItems?: NavigationSubItem[];
  }

  /**
   * Main navigation item
   */
  interface NavigationMainItem extends BaseNavigationItem {
    path?: string;
    type?: "dropdown";
    subItems?: NavigationSubItem[];
  }

  /**
   * Navigation configuration
   */
  interface NavigationConfig {
    mainItems: NavigationMainItem[];
  }

  /**
   * Simplified navigation item
   */
  interface NavigationItem {
    key: string;
    label: string;
    path: string;
    icon: string;
  }


  /**
   * UI configuration
   */
  interface UIConfig {
    [key: string]: string | null;
    onboarding?: OnboardingFeature[];
  }

  /**
   * Main application configuration
   * Uses GenericDataTypeConfig for full dynamic support
   */
  interface BasicConfig {
    version?: string;
    locale?: string;
    ui?: UIConfig;
    navigation: NavigationConfig;
    dataTypes: Record<string, GenericDataTypeConfig>;
  }


  /**
   * Supported languages
   */
  type Language = "de" | "en" | "fr" | "ar";

  /**
   * Translation value can be a string or nested object
   */
  type TranslationValue = string | Record<string, unknown>;

  /**
   * Translation data type configuration with create/update/view fields
   * Uses GenericDisplayField and GenericFormField for full dynamic support
   */
  interface TranslationDataTypeConfig {
    title?: string;
    icon?: string;
    filePath?: string;
    primaryField?: string;
    defaultSortField?: string;
    defaultSortOrder?: "asc" | "desc";
    searchFields?: string[];
    view?: GenericDisplayField[];
    create?: GenericFormField[];
    update?: GenericFormField[];
  }

  /**
   * Translation navigation item structure
   */
  interface TranslationNavigationItem {
    key: string;
    title: string;
    icon: string;
    path?: string;
    type?: "dropdown";
    subItems?: TranslationNavigationItem[];
  }

  /**
   * DateTimePicker translations structure
   */
  interface DateTimePickerTranslations {
    hour?: string;
    minute?: string;
    amPm?: string;
    am?: string;
    pm?: string;
    ok?: string;
    cancel?: string;
    months?: {
      january?: string;
      february?: string;
      march?: string;
      april?: string;
      may?: string;
      june?: string;
      july?: string;
      august?: string;
      september?: string;
      october?: string;
      november?: string;
      december?: string;
    };
    weekdays?: {
      sunday?: string;
      monday?: string;
      tuesday?: string;
      wednesday?: string;
      thursday?: string;
      friday?: string;
      saturday?: string;
    };
  }

  /**
   * Translations structure from JSON files
   */
  interface Translations {
    version?: string;
    locale?: string;
    ui?: Record<string, string>;
    language?: {
      menu?: Record<string, string>;
      tooltipTitle?: Record<string, string>;
      ariaLabel?: Record<string, string>;
      ariaTooltipLabel?: Record<string, string>;
      [key: string]: Record<string, string> | undefined;
    };
    navigation?: {
      languageMenu?: string;
      mainItems?: TranslationNavigationItem[];
      [key: string]: string | TranslationNavigationItem[] | undefined;
    };
    dataTypes?: Record<string, TranslationDataTypeConfig>;
    datetimePicker?: DateTimePickerTranslations;
    pathNames?: Record<string, string>;
    [key: string]: TranslationValue | undefined;
  }

  /**
   * I18n store state
   */
  interface I18nState {
    language: Language;
    translations: Translations;
    setLanguage: (lang: Language) => Promise<void>;
    t: (key: string) => string;
    loadTranslations: (lang: Language) => Promise<void>;
    isRTL: () => boolean;
    getLocale: () => string;
    getTimezone: () => string;
    formatDate: (dateString: string) => string;
    formatDateTime: (dateTimeString: string) => { date: string; time: string };
  }


  /**
   * Available sort fields
   */
  type SortField =
    | "title"
    | "priority"
    | "category"
    | "dueDate"
    | "createdAt"
    | "word"
    | "translation"
    | "date"
    | "time"
    | "start"
    | "end"
    | "location"
    | "reminder"
    | "language"
    | "difficulty";

  /**
   * Sort order
   */
  type SortOrder = "asc" | "desc";

  /**
   * Pagination props for components
   */
  interface PaginationProps {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (items: number) => void;
  }

  /**
   * Props for create mode components
   */
  interface CreateModeProps {
    slug: string;
    dataType: string;
    id?: string;
  }

  /**
   * Props for todo table components
   */
  interface TodoTableProps {
    dataType: string;
    searchFields?: string[];
    displayFields?: DisplayField[];
  }

  /**
   * Search parameter type for new query-based routing
   */
  type SearchParams = {
    view?: string;
    create?: string;
    id?: string;
  };

  /**
   * Generic form field for dynamic JSON structures
   * All form fields are defined dynamically via JSON configuration (de.json)
   */
  interface GenericFormField extends BaseField {
    type:
    | "text"
    | "textarea"
    | "select"
    | "date"
    | "time"
    | "datetime"
    | "number"
    | "checkbox"
    | "array"
    | "email"
    | "tel"
    | "url"
    | "password"
    | "address";
    required: boolean;
    placeholder?: string;
    helperText?: string;
    onFocused?: boolean;
    options?: FormFieldOption[];
    arrayConfig?: ArrayFieldConfig;
    step?: number;
    min?: number;
    max?: number;
    grid?: number;
    hidden?: boolean;
    copy?: boolean;
  }

  /**
   * Generic display field for dynamic JSON structures
   * All display fields are defined dynamically via JSON configuration (de.json)
   */
  interface GenericDisplayField extends BaseField {
    type?:
    | "text"
    | "date"
    | "datetime"
    | "number"
    | "priority"
    | "category"
    | "chip"
    | "email"
    | "tel"
    | "url";
    hidden?: boolean;
  }

  /**
   * Generic data type configuration for flexible JSON structures
   * This is the primary configuration type - all data type configs use this
   */
  interface GenericDataTypeConfig {
    title: string;
    icon: string;
    filePath: string;
    primaryField: string;
    defaultSortField?: string;
    defaultSortOrder?: "asc" | "desc";
    searchFields: string[];
    view: GenericDisplayField[];
    create: GenericFormField[];
    update: GenericFormField[];
  }

  /**
   * Snackbar state for notifications
   */
  interface SnackbarState {
    snack: { message: string; severity: string; open: boolean };
    setSnack: (message: string, severity: string) => void;
    closeSnack: () => void;
  }

  /**
   * Theme state for theme management
   */
  interface ThemeState {
    mode: ThemeMode;
    isRTL: boolean;
    direction: Direction;
    setMode: (mode: ThemeMode) => void;
    setIsRTL: (isRTL: boolean) => void;
  }

  /**
   * Theme mode
   */
  type ThemeMode = "light" | "dark" | "contrast";

  /**
   * Text direction
   */
  type Direction = "ltr" | "rtl";

  type SnackSeverity = "success" | "error" | "warning" | "info" | "";
  type SoundEvent = "create" | "update" | "delete";

  interface SoundStore {
    enabled: boolean;
    volume: number;
    setEnabled: (enabled: boolean) => void;
    setVolume: (volume: number) => void;
    playSnack: (severity: SnackSeverity) => void;
    playTone: (frequency: number, durationMs?: number) => void;
    playEvent: (event: SoundEvent) => void;
    unlock: () => Promise<void>;
  }

  interface DateTimePickerProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    required?: boolean;
    error?: boolean;
    helperText?: string;
    disabled?: boolean;
    getTimezone?: () => string | null;
    customInputStyle?: React.CSSProperties;
    onFocus?: () => void;
    onBlur?: () => void;
  }

  interface TinyMCEEditorProps {
    value: string;
    onChange: (value: string) => void;
    apiKey: string;
    init?: TinyMCESettings;
    placeholder?: string;
    disabled?: boolean;
  }

  /**
   * Interface for the TinyMCE Editor instance
   * Provides methods to interact with the editor
   */
  interface TinyMCEEditorInstance {
    initialized: boolean;
    mode: {
      set: (mode: 'design' | 'readonly') => void;
    };
    setContent: (content: string) => void;
    getContent: () => string;
    on: (events: string, callback: () => void) => void;
    remove: () => void;
    getContainer: () => HTMLElement;
    iframeElement?: HTMLIFrameElement;
  }

  /**
   * AI Request interface for TinyMCE
   */
  interface TinyMCEAIRequest {
    [key: string]: unknown;
  }

  /**
   * AI Response handler interface
   */
  interface TinyMCEAIResponder {
    string: (callback: () => Promise<string>) => void;
  }

  /**
   * Configuration settings for TinyMCE
   */
  interface TinyMCESettings {
    selector?: string;
    target?: HTMLElement;
    plugins?: string[];
    toolbar?: string;
    tinycomments_mode?: 'embedded' | 'unbound';
    tinycomments_author?: string;
    mergetags_list?: Array<{ value: string; title: string }>;
    ai_request?: (request: TinyMCEAIRequest, respondWith: TinyMCEAIResponder) => void;
    uploadcare_public_key?: string;
    setup?: (editor: TinyMCEEditorInstance) => void;
    [key: string]: unknown;
  }

  /**
   * Global TinyMCE object interface
   */
  interface TinyMCE {
    init: (settings: TinyMCESettings) => Promise<TinyMCEEditorInstance[]>;
    get: (id: string | HTMLElement | null) => TinyMCEEditorInstance | null;
    activeEditor: TinyMCEEditorInstance | null;
    remove: (selector?: string | HTMLElement) => void;
  }

  interface Window {
    webkitAudioContext?: typeof AudioContext;
    tinymce: TinyMCE;
  }

  /**
   * Gemeinsames Interface für Reminder-Status
   * Wird für Events, Todos und andere Reminder-Items verwendet
   */
  interface ReminderStatus {
    itemId: string;
    category: string;
    sentAt: number;
    itemEnd: number;
  }

  type JournalType = "privateJournal" | "schoolJournal";
  interface DocItem {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    isArchive: boolean;
  }

  interface DocsState {
    docs: DocItem[];
    isLoading: boolean;
    error: string | null;
    selectedDocId: string | null;
    fetchDocs: () => Promise<void>;
    createDoc: (doc: Partial<DocItem>) => Promise<void>;
    updateDoc: (id: string, updates: Partial<DocItem>) => Promise<void>;
    archiveDoc: (id: string) => Promise<void>;
    setSelectedDocId: (id: string | null) => void;
  }
  interface SidebarState {
    isOpen: boolean;
    activePath: string | null;
    setIsOpen: (value: boolean) => void;
    toggleSidebar: () => void;
    setActivePath: (path: string) => void;
  }

  interface ExpenseItem {
    key: string;
    value: number;
  }

  interface ExpenseData {
    id: string;
    date: string;
    store: string;
    items: ExpenseItem[];
    isArchive: boolean;
  }

  interface AnalyzedData {
    store: string;
    date: string;
    items: ExpenseItem[];
  }

  interface DashyItem {
    name: string;
    url: string;
    icon?: string;
    iconUrl?: string;
    isArchive?: boolean;
    updatedAt?: string;
  }

  interface DashyItemWithMeta extends DashyItem {
    id: string;
    sectionId: string;
    sectionTitle: string;
    itemIndex: number;
    createdAt: string;
    updatedAt: string;
    isArchive: boolean;
  }

  interface DashySection {
    id: string;
    title: string;
    icon: string;
    items: DashyItem[];
  }

  interface DashyData {
    title: string;
    user: {
      name: string;
      greeting: string;
    };
    header: {
      searchPlaceholder: string;
      design: {
        current: string;
        options: string[];
      };
      layout: string[];
      itemSize: string[];
    };
    footer: {
      text: string;
    };
    widgets: Array<{
      id: string;
      title: string;
      icon: string;
      type: string;
      gridColumns: number;
      data: Record<string, unknown>;
    }>;
    sections: DashySection[];
  }

  /** Portfoilo 
   * @example
   * {
   *  "id": "1",
   *  "title": "Project 1",
   *  "description": "Description 1",
   *  "technologies": ["Technology 1", "Technology 2"],
   *  "image": "image.jpg",
   *  "demoUrl": "https://demo.com",
   *  "repoUrl": "https://github.com/repo"
   * }
  */
  interface Project {
    id: string;
    title: string;
    description: string;
    technologies: string[];
    image: string | null;
    demoUrl: string;
    repoUrl: string;
  }

  interface TechnicalSkill {
    name: string;
    level: number;
  }

  interface SoftSkill {
    name: string;
    icon: string;
  }

  interface MediaCompetence {
    name: string;
    proficiency: number;
  }

  interface SocialCompetence {
    name: string;
    proficiency: number;
  }

  interface Experience {
    id: string;
    company: string;
    position: string;
    period: string;
    description: string;
    achievements: string[];
  }

  interface Contact {
    email: string;
    location: string;
    social: {
      linkedin: string;
      github: string;
      xing?: string;
      youtube?: string;
      loading?: string;
    };
    loading?: string;
  }

  interface Profile {
    name: string;
    firstName: string;
    lastName: string;
    title: string;
    bio: string;
    email: string;
    image: string;
  }


  interface PortfolioLanguage {
    name: string;
    level: string;
    proficiency: number;
  }


  interface Hobby {
    icon: string;
    name: string;
  }

  interface Education {
    id: string;
    period: string;
    description: string;
  }

  interface AboutMe {
    caption: string;
    text: string;
  }

  interface Theme {
    primary: string;
    accent: string;
    bg: string;
    paper: string;
    paperSec: string;
    text: string;
    textSec: string;
    divider: string;
    gradient: string;
    shadowSm: string;
    shadowMd: string;
    shadowLg: string;
    shadowPrimary: string;
  }

  interface DocFolder {
    title: string;
    pages?: Record<string, string>;
    [key: string]: string | DocFolder | Record<string, string> | undefined;
  }

  type MetaData = Record<string, string | DocFolder>;

  interface FolderItemProps {
    title: string;
    pages?: Record<string, string>;
    parentKey: string;
    theme: Theme;
    currentPage: string;
    nestedItems?: MetaData;
  }

  /** Portfolio 
   *  
  */
  interface PortfolioData {
    traits: string[];
    projects: Project[];
    skills: {
      technicalSkills: TechnicalSkill[];
      mediaCompetence: MediaCompetence[];
      socialCompetence: SocialCompetence[];
    };
    experiences: Experience[];
    contact: Contact;
    profile: Profile;
    languages: PortfolioLanguage[];
    hobbies: Hobby[];
    education: Education[];
    internships: Education[];
    aboutMe: AboutMe;

    ui?: {
      loading?: string;
      hero?: {
        greeting?: string;
        downloadCV?: string;
        contactMe?: string;
        learnMore?: string;
      };
      navigation?: {
        about?: string;
        aboutHref?: string;
        projects?: string;
        projectsHref?: string;
        skills?: string;
        skillsHref?: string;
        experience?: string;
        experienceHref?: string;
        contact?: string;
        contactHref?: string;
        blog?: string;
        blogHref?: string;
        toggleMenu?: string;
      };
      contact?: {
        title?: string;
        subtitle?: string;
        contactInfo?: string;
        description?: string;
        form?: {
          name?: string;
          email?: string;
          message?: string;
          namePlaceholder?: string;
          emailPlaceholder?: string;
          messagePlaceholder?: string;
          send?: string;
          sending?: string;
        };
        messages?: {
          successTitle?: string;
          successMessage?: string;
          errorTitle?: string;
          errorSend?: string;
          errorGeneric?: string;
        };
        ariaLabels?: {
          linkedin?: string;
          github?: string;
          email?: string;
        };
      };
      projects?: {
        label?: string;
        title?: string;
        demo?: string;
      };
      education?: {
        label?: string;
        title?: string;
      };
      experience?: {
        label?: string;
        title?: string;
        achievements?: string;
      };
      skills?: {
        label?: string;
        title?: string;
        mediaCompetence?: string;
        socialCompetence?: string;
      };
      languages?: {
        label?: string;
        title?: string;
      };
      internships?: {
        label?: string;
        title?: string;
      };
      hobbies?: {
        label?: string;
        title?: string;
      };
      footer?: {
        rights?: string;
        created?: string;
      };
    };
  }

  /** Wheel
   * @example
   * {
   *  "title": "Englischlernen",
   *  "spinDuration": 1,
   *  "ui": {
   *    "spinButton": {
   *      "idle": "Drehen",
   *      "spinning": "Drehen..."
   *    },
   *    "result": {
   *      "empty": "Keine Ergebnisse"
   *    }
   *  },
   *  "items": [
   *    {
   *      "key": "Autonomous Mobility System",
   *      "value": "Autonomes Mobilitätssystem"
   *    }
   *  ]
   * }
   */

  interface RandomPieItemData {
    key: string;
    value: string;
  }

  interface RandomPieUI {
    spinButton: {
      idle: string;
      spinning: string;
    };
    result: {
      empty: string;
    };
  }

  interface RandomPieData {
    title: string;
    spinDuration: number;
    ui: RandomPieUI;
    items: RandomPieItemData[];
  }

  interface WheelItem extends RandomPieItemData {
    id: string;
    color: string;
  }
  interface CodeBlockProps extends React.HTMLAttributes<HTMLElement> {
    node?: any;
    children?: React.ReactNode;
    className?: string;
  }
  interface OnboardingFeature {
    link: string;
    title: string;
    desc: string;
    icon: string;
  }
  interface MarkdownLiProps extends React.LiHTMLAttributes<HTMLLIElement> {
    checked?: boolean;
  }
}

export { };
