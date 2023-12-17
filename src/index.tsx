import { User } from "discord-types/general";
import { Injector, common, components, webpack } from "replugged";

const { getDMFromUserId } = common.channels;
const { getChannel } = common.channels;

const { Flex, Text } = components;

const injector = new Injector();

function convertSnowflakeToDate(id: string | number | undefined): Date | undefined {
  if (!id) return;
  const milliseconds = BigInt(id) >> 22n;
  return new Date(Number(milliseconds) + 1420070400000);
}

function getFriendDate(userID: string): Date | undefined {
  const dmChannelId = getDMFromUserId(userID)!;
  const dmChannel = getChannel(dmChannelId);
  const date = convertSnowflakeToDate(dmChannel?.lastMessageId);
  return date;
}

export function start(): void {
  const mod = webpack.getBySource(
    /let{hideDiscriminator:.=!1,user:.,nick:.,forceUsername:.,showAccountIdentifier:/,
    { raw: true },
  );

  injector.instead<typeof mod.export, "default", [{user: User, primary: unknown}]>(mod.exports, "default", ([args], Orig) => {
    const {user} = args;

    const dmTime = getFriendDate(user.id)?.toDateString() || "Unknown";

    const name = (
      <>
        <Flex>
          { // @ts-expect-error `discord-types` hasn't updated yet
          user.globalName}
          <Text style={{ marginLeft: 5, color: "var(--header-secondary)" }} variant="text-sm/normal">
            Last DMed: {dmTime}
          </Text>
        </Flex>
      </>
    );

    return <Orig {...args} primary={name}></Orig>;
  });
}

export function stop(): void {
  injector.uninjectAll();
}
