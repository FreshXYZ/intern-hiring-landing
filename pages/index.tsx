import { ChangeEventHandler, useCallback, useEffect, useState } from 'react';
import { FirebaseError } from 'firebase/app';
import {
  AuthErrorCodes,
  getAuth,
  GithubAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  User,
} from 'firebase/auth';
import {
  doc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Tasks from '../components/tasks';
import figma from '../public/images/figma.svg';
import googleFonts from '../public/images/google-fonts.svg';
import sparkle from '../public/images/sparkle.svg';
import type { NextPage } from 'next';

const Home: NextPage = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [finishedAt, setFinishedAt] = useState<Date | null>(null);
  const [isLoggingIn, setLoggingIn] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [startedAt, setStartedAt] = useState<Date | null>(null);

  const onStart = useCallback(() => {
    setLoggingIn(true);

    const provider = new GithubAuthProvider();
    const auth = getAuth();

    signInWithPopup(auth, provider)
      .then((result) => {
        const firestore = getFirestore();

        setDoc(
          doc(firestore, 'users', result.user.uid),
          {
            finishedAt: null,
            metadata: {
              email: result.user.email,
              displayName: result.user.displayName,
            },
            startedAt: serverTimestamp(),
          },
          {
            merge: false,
          },
        );
      })
      .catch((error) => {
        if (
          error instanceof FirebaseError &&
          error.code === AuthErrorCodes.USER_CANCELLED
        ) {
          return;
        }

        toast.error(
          'Oops! Something went wrong. Please contact us if this issue persists.',
        );
      })
      .finally(() => {
        setLoggingIn(false);

        window.scrollTo(0, 0);
      });
  }, []);

  const onSubmit = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      if (!currentUser?.uid) return;

      if (!e.target.files?.length) return;

      const file = e.target.files[0];
      const storage = getStorage();

      setSubmitting(true);

      uploadBytes(ref(storage, `submissions/${currentUser.uid}.zip`), file)
        .then(() => {
          const firestore = getFirestore();

          updateDoc(doc(firestore, 'users', currentUser.uid), {
            finishedAt: serverTimestamp(),
          });
        })
        .catch(() => {
          toast.error(
            'Oops! Something went wrong. Please contact us if this issue persists.',
          );
        })
        .finally(() => {
          setSubmitting(false);
        });
    },
    [currentUser?.uid],
  );

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};

    if (currentUser?.uid) {
      const firestore = getFirestore();

      unsubscribe = onSnapshot(
        doc(firestore, 'users', currentUser.uid),
        (userData) => {
          if (userData.exists()) {
            setStartedAt(userData.data().startedAt?.toDate() ?? null);
            setFinishedAt(userData.data().finishedAt?.toDate() ?? null);
          } else {
            setStartedAt(null);
            setFinishedAt(null);
          }
        },
        () => {
          setStartedAt(null);
          setFinishedAt(null);
        },
      );
    }

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid]);

  if (finishedAt) {
    return (
      <div className="h-screen bg-black text-white">
        <div className="lg:py-32">
          <div className="mx-auto max-w-screen-lg p-10">
            <div className="flex items-center justify-center font-mono text-3xl font-bold text-gray-50 lg:gap-8 lg:text-8xl">
              <span>THANK</span>
              <svg
                className="w-32 lg:w-56"
                viewBox="0 0 224 178"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M83.8724 57.0557C59.2058 35.0557 24.6724 -6.54428 83.8724 3.05572C143.072 12.6557 139.206 33.7224 129.873 43.0558C162.539 17.7224 226.673 -17.7442 221.873 43.0558C219.502 73.0797 207.605 85.4812 193.6 88.7377C201.295 96.6364 203.579 108.886 197.873 125.056C183.235 166.531 153.451 159.145 131.781 142.604C127.199 147.157 119.535 152.445 107.872 158.641C43.8724 192.641 -0.127625 173.056 31.8724 139.056C57.4724 111.856 77.2058 95.7224 83.8724 91.0558C57.8724 102.389 1.87207 93.8557 1.87207 57.0557C1.87207 20.2557 57.8724 49.0557 83.8724 57.0557Z"
                  fill="#FDC62D"
                  stroke="black"
                  strokeWidth="2"
                />
              </svg>
              <span>YOU</span>
            </div>
            <p className="mt-28 text-center lg:mt-52 lg:text-2xl">
              We will be in touch shortly!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (startedAt) {
    return (
      <div className="bg-black text-white">
        <div className="lg:py-32">
          <div className="mx-auto max-w-screen-lg p-10">
            <div className="flex items-center justify-center font-mono text-3xl font-bold text-gray-50 lg:gap-8 lg:text-8xl">
              <span>YOU</span>
              <svg
                className="w-32 lg:w-56"
                viewBox="0 0 224 178"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M83.8724 57.0557C59.2058 35.0557 24.6724 -6.54428 83.8724 3.05572C143.072 12.6557 139.206 33.7224 129.873 43.0558C162.539 17.7224 226.673 -17.7442 221.873 43.0558C219.502 73.0797 207.605 85.4812 193.6 88.7377C201.295 96.6364 203.579 108.886 197.873 125.056C183.235 166.531 153.451 159.145 131.781 142.604C127.199 147.157 119.535 152.445 107.872 158.641C43.8724 192.641 -0.127625 173.056 31.8724 139.056C57.4724 111.856 77.2058 95.7224 83.8724 91.0558C57.8724 102.389 1.87207 93.8557 1.87207 57.0557C1.87207 20.2557 57.8724 49.0557 83.8724 57.0557Z"
                  fill="#FDC62D"
                  stroke="black"
                  strokeWidth="2"
                />
              </svg>
              <span>HAVE</span>
            </div>
            <div
              className="-mt-4 flex items-center justify-center font-mono text-[84px] font-bold leading-none text-transparent lg:-mt-12 lg:text-[200px]"
              style={{
                WebkitTextStrokeColor: 'white',
                WebkitTextStrokeWidth: 3,
              }}
            >
              <div className="relative">
                <span className="relative z-20">2HOURS</span>
              </div>
            </div>
            <div className="mt-32 flex items-center justify-center gap-2">
              <p className="lg:text-2xl">What you&rsquo;ll need</p>
              <svg
                width="25"
                height="25"
                viewBox="0 0 25 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.5 4.5V20.5M12.5 20.5L18.5 14.5M12.5 20.5L6.5 14.5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="mt-2 flex items-center justify-center">
              <Image
                alt="Sparkle"
                height={79}
                objectFit="contain"
                src={sparkle}
                width={140}
              />
            </div>
            <div className="card mx-auto mt-16 max-w-md">
              <div className="flex items-center gap-4">
                <svg
                  className="h-6 w-6"
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>GitHub</title>
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                <p className="font-mono text-2xl font-bold">GitHub</p>
              </div>
              <a
                className="btn mt-6"
                href="https://github.com/FreshXYZ/hiring-intern"
                rel="noopener noreferrer"
                target="_blank"
              >
                Go to repository
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.33301 10H16.6663M16.6663 10L11.6663 5M16.6663 10L11.6663 15"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
            <div className="card mx-auto mt-16 max-w-md">
              <div className="flex items-center gap-4">
                <Image
                  alt="Figma"
                  height={36}
                  objectFit="contain"
                  src={figma}
                  width={24}
                />
                <p className="font-mono text-2xl font-bold">Figma</p>
              </div>
              <a
                className="btn mt-6"
                href="https://www.figma.com/file/x8bsnfDnTVRqW8mvSPZKYx/Fresh-Engineering-Intern?node-id=0%3A1"
                rel="noopener noreferrer"
                target="_blank"
              >
                Go to Figma file
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.33301 10H16.6663M16.6663 10L11.6663 5M16.6663 10L11.6663 15"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
            <div className="card mx-auto mt-16 max-w-md">
              <p className="font-mono text-2xl font-bold">Typefaces</p>
              <div className="mt-6 p-4">
                <a
                  className="flex items-center gap-4 font-mono text-lg underline"
                  href="https://fonts.google.com/specimen/Space+Mono"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    alt="Google Fonts"
                    height={25}
                    objectFit="contain"
                    src={googleFonts}
                    width={24}
                  />
                  <span>Space Mono</span>
                </a>
                <a
                  className="mt-8 flex items-center gap-4 font-mono text-lg underline"
                  href="https://fonts.google.com/specimen/Space+Grotesk"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    alt="Google Fonts"
                    height={25}
                    objectFit="contain"
                    src={googleFonts}
                    width={24}
                  />
                  <span>Space Grotesk</span>
                </a>
              </div>
            </div>
            <div className="mx-auto mt-28 max-w-lg md:mt-40">
              <p className="text-center font-mono text-7xl font-bold">SUBMIT</p>
              <p className="mt-8 text-center">
                {
                  'All done? Upload your .zip file before the timer ends to finish the assignment.Remember to run '
                }
                <code className="text-[#fdc62d]">
                  rm -rf .next node_modules
                </code>
                {' before zipping the project.'}
              </p>
              <div className="mt-4 flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4V20M12 20L18 14M12 20L6 14"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="mt-8 flex items-center justify-center">
                <label className="btn cursor-pointer" htmlFor="zip-picker">
                  {isSubmitting ? 'Uploading...' : 'Upload .zip file'}
                </label>
                <input
                  hidden
                  accept=".zip"
                  disabled={isSubmitting}
                  id="zip-picker"
                  type="file"
                  onChange={onSubmit}
                />
              </div>
            </div>
            <div className="mt-28 md:mt-40">
              <Tasks />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white">
      <div className="lg:py-32">
        <div className="mx-auto max-w-screen-lg p-10">
          <div className="flex items-center justify-center font-mono text-3xl font-bold text-gray-50 lg:gap-8 lg:text-8xl">
            <span>WELCOME</span>
            <svg
              className="w-32 lg:w-56"
              viewBox="0 0 224 178"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M83.8724 57.0557C59.2058 35.0557 24.6724 -6.54428 83.8724 3.05572C143.072 12.6557 139.206 33.7224 129.873 43.0558C162.539 17.7224 226.673 -17.7442 221.873 43.0558C219.502 73.0797 207.605 85.4812 193.6 88.7377C201.295 96.6364 203.579 108.886 197.873 125.056C183.235 166.531 153.451 159.145 131.781 142.604C127.199 147.157 119.535 152.445 107.872 158.641C43.8724 192.641 -0.127625 173.056 31.8724 139.056C57.4724 111.856 77.2058 95.7224 83.8724 91.0558C57.8724 102.389 1.87207 93.8557 1.87207 57.0557C1.87207 20.2557 57.8724 49.0557 83.8724 57.0557Z"
                fill="#FDC62D"
                stroke="black"
                strokeWidth="2"
              />
            </svg>
            <span>TO</span>
          </div>
          <div
            className="-mt-4 flex items-center justify-center font-mono text-[84px] font-bold leading-none text-transparent lg:-mt-12 lg:text-[200px]"
            style={{ WebkitTextStrokeColor: 'white', WebkitTextStrokeWidth: 3 }}
          >
            <div className="relative">
              <span className="relative z-20">FRESH</span>
              <svg
                className="absolute bottom-0 left-0 z-10 w-20 translate-y-1/2 -translate-x-1/2 lg:w-52"
                viewBox="0 0 225 192"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.40568 190.499C-8.32191 98.5938 2.35532 -62.6479 162.885 27.6307C323.415 117.909 125.453 173.826 6.40568 190.499Z"
                  fill="#005246"
                />
                <path
                  d="M155.655 41.9041C143.491 30.5114 111.213 22.5321 79.4208 81.7576C47.6286 140.983 22.9196 168.224 14.5391 174.442M6.40568 190.499C-8.32191 98.5938 2.35532 -62.6479 162.885 27.6307C323.415 117.909 125.453 173.826 6.40568 190.499Z"
                  stroke="black"
                  strokeWidth="2"
                />
              </svg>
              <svg
                className="absolute bottom-0 right-0 z-30 w-20 translate-y-1/2 translate-x-1/2 lg:w-52"
                viewBox="0 0 217 150"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M71.9309 147.949C76.5976 82.6154 288 28 189.931 1.94876C79.2643 18.6154 -99.2691 71.1488 71.9309 147.949Z"
                  fill="#00FFB4"
                  stroke="black"
                  strokeWidth="2"
                />
                <path
                  d="M57.9998 114C53.3332 95.3333 67.1998 51.2 160 24"
                  stroke="black"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
          <p className="mt-28 text-center lg:mt-52 lg:text-2xl">
            Hey future Freshies, ready to start your coding assignment?
            <br />
            Here are a few things you need to know!
          </p>
          <div className="mt-2 flex items-center justify-center">
            <Image
              alt="Sparkle"
              height={79}
              objectFit="contain"
              src={sparkle}
              width={140}
            />
          </div>
          <div className="mt-24 grid grid-cols-2 gap-8 md:gap-12">
            <div className="card col-span-2 md:col-span-1">
              <p className="font-mono text-2xl font-bold">The assignment</p>
              <div className="mt-6 flex items-center gap-1">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17 17L22 12L17 7M7 7L2 12L7 17M14 3L10 21"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="font-semibold">What you&rsquo;ll build</p>
              </div>
              <p className="mt-1">
                Complete 3 small tasks to build a log-in page.
              </p>
              <div className="mt-4 flex items-center gap-1">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="font-semibold">Time limit</p>
              </div>
              <p className="mt-1">
                2 hours. Complete as many tasks as you can 🙂 A timer will be
                activated when you click &quot;Let&rsquo;s code&quot; button
                below.
              </p>
            </div>
            <div className="card col-span-2 md:col-span-1">
              <p className="font-mono text-2xl font-bold">
                What you&rsquo;ll need
              </p>
              <div className="mt-6 flex items-center gap-1">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 16C12.866 16 16 12.866 16 9C16 5.13401 12.866 2 9 2C5.13401 2 2 5.13401 2 9C2 12.866 5.13401 16 9 16Z"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 22C18.866 22 22 18.866 22 15C22 11.134 18.866 8 15 8C11.134 8 8 11.134 8 15C8 18.866 11.134 22 15 22Z"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="font-semibold">The design</p>
              </div>
              <p className="mt-1">
                A Figma design file and links to typefaces will be provided
                after you start the assignment!
              </p>
              <div className="mt-4 flex items-center gap-1">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22 9H2M14 17.5L16.5 15L14 12.5M10 12.5L7.5 15L10 17.5M2 7.8L2 16.2C2 17.8802 2 18.7202 2.32698 19.362C2.6146 19.9265 3.07354 20.3854 3.63803 20.673C4.27976 21 5.11984 21 6.8 21H17.2C18.8802 21 19.7202 21 20.362 20.673C20.9265 20.3854 21.3854 19.9265 21.673 19.362C22 18.7202 22 17.8802 22 16.2V7.8C22 6.11984 22 5.27977 21.673 4.63803C21.3854 4.07354 20.9265 3.6146 20.362 3.32698C19.7202 3 18.8802 3 17.2 3L6.8 3C5.11984 3 4.27976 3 3.63803 3.32698C3.07354 3.6146 2.6146 4.07354 2.32698 4.63803C2 5.27976 2 6.11984 2 7.8Z"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="font-semibold">Text editor of choice</p>
              </div>
              <p className="mt-1">
                You can use your favourite text editor to code.
              </p>
            </div>
          </div>
          <div className="mt-28 lg:mt-80">
            <Tasks />
          </div>
        </div>
        <div className="mt-48 md:mt-80">
          <div className="flex justify-center overflow-hidden">
            {Array.from(new Array(11).keys()).map((item) => (
              <div
                key={item}
                className="font-mono text-[72px] font-bold text-transparent lg:text-8xl"
                style={{
                  WebkitTextStrokeColor: 'white',
                  WebkitTextStrokeWidth: 3,
                }}
              >
                READY?
              </div>
            ))}
          </div>
          <div className="mt-12 p-10">
            <p className="mx-auto max-w-md text-center text-gray-300">
              2-hour timer will start when you click &quot;Let&rsquo;s
              code&quot;. Make sure you have everything you need. Good luck!
            </p>
            <div className="mt-8 flex justify-center">
              <button
                className="btn"
                disabled={isLoggingIn}
                type="button"
                onClick={onStart}
              >
                Let&rsquo;s code!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
